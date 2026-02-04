import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, tap } from 'rxjs';
import { Pokemon } from '../../src/app/models/pokemon.module';
import { environment } from '../environments/environment.development';
import { PokemonSpecies } from '../app/models/pokemon-species.module';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private API = environment.api;
  private SPECIES_API = environment.especiesApi;
  private baseSpeciesCache: PokemonSpecies[] = [];
  private speciesOffset = 0;
  private evolutionCache = new Map<number, Pokemon[]>();
  private readonly SPECIES_PAGE_SIZE = 40;

  constructor(private http: HttpClient) {}

  private extractId(url: string): number {
    return Number(url.split('/').filter(Boolean).pop());
  }

  private toPokemon(detail: any): Pokemon {
    return {
      id: detail.id,
      name: detail.name,
      image:
        detail.sprites.other['official-artwork'].front_default ??
        detail.sprites.front_default ??
        '',
      types: detail.types.map((t: any) => t.type.name),
    };
  }

  private parseEvolutionChain(chain: any): Observable<Pokemon[]> {
    const requests: Observable<Pokemon>[] = [];
    let current = chain;

    while (current) {
      const id = this.extractId(current.species.url);

      requests.push(
        this.http.get<any>(`${this.API}/${id}`).pipe(map((detail) => this.toPokemon(detail))),
      );
      current = current.evolves_to[0];
    }
    return forkJoin(requests);
  }

  getPokemonSpecies(id: number): Observable<any> {
    return this.http.get(`${this.SPECIES_API}/${id}`);
  }

  getBasePokemons(page = 0, limit = 20): Observable<Pokemon[]> {
    const required = (page + 1) * limit;

    return this.fetchBaseSpeciesUpTo(required).pipe(
      map((allBases) => {
        const start = page * limit;
        return allBases.slice(start, start + limit);
      }),
      switchMap((pageBases) =>
        forkJoin<Pokemon[]>(
          pageBases.map((s) =>
            this.http.get<any>(`${this.API}/${s.id}`).pipe(map((d) => this.toPokemon(d))),
          ),
        ),
      ),
    );
  }

  private fetchBaseSpeciesUpTo(count: number): Observable<PokemonSpecies[]> {
    if (this.baseSpeciesCache.length >= count) {
      return of(this.baseSpeciesCache);
    }

    return this.http
      .get<{
        results: { url: string }[];
      }>(`${this.SPECIES_API}?offset=${this.speciesOffset}&limit=${this.SPECIES_PAGE_SIZE}`)
      .pipe(
        switchMap((res) =>
          forkJoin<PokemonSpecies[]>(res.results.map((s) => this.http.get<PokemonSpecies>(s.url))),
        ),
        switchMap((speciesList) => {
          const bases = speciesList.filter((s) => s.evolves_from_species === null);

          this.baseSpeciesCache.push(...bases);
          this.speciesOffset += this.SPECIES_PAGE_SIZE;

          if (this.baseSpeciesCache.length >= count) {
            return of(this.baseSpeciesCache);
          }

          return this.fetchBaseSpeciesUpTo(count);
        }),
      );
  }

  getEvolutionByPokemonId(id: number): Observable<Pokemon[]> {
    if (this.evolutionCache.has(id)) {
      return of(this.evolutionCache.get(id)!);
    }

    return this.getPokemonSpecies(id).pipe(
      switchMap((species) => this.http.get<any>(species.evolution_chain.url)),
      switchMap((chain) => this.parseEvolutionChain(chain.chain)),
      tap((evolutions) => {
        this.evolutionCache.set(id, evolutions);
      }),
    );
  }
}
