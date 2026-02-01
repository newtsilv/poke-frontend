import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Pokemon } from '../../src/app/models/pokemon.module';
import { environment } from '../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private baseSpeciesCache: any[] | null = null;
  private API = environment.api;
  private SPECIES_API = environment.especiesApi;

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
  private parseEvolutionChain(chain: any) {
    const requests = [];

    let current = chain;

    while (current) {
      const id = this.extractId(current.species.url);

      requests.push(
        this.http.get<any>(`${this.API}/${id}`).pipe(
          map((detail) => ({
            id,
            name: detail.name,
            image:
              detail.sprites.other['official-artwork'].front_default ??
              detail.sprites.front_default ??
              '',
            types: detail.types.map((t: any) => t.type.name),
          })),
        ),
      );

      current = current.evolves_to[0];
    }

    return forkJoin(requests);
  }

  getPokemonSpecies(id: number): Observable<any> {
    return this.http.get(`${this.SPECIES_API}/${id}`);
  }

  getEvolutionChain(url: string): Observable<any> {
    return this.http.get(url);
  }

  getBaseSpecies(page = 0, limit = 20): Observable<any[]> {
    const offset = page * limit;

    return this.http.get<any>(`${this.SPECIES_API}?offset=${offset}&limit=${limit}`).pipe(
      switchMap((res) => forkJoin<any[]>(res.results.map((s: any) => this.http.get<any>(s.url)))),
      map((speciesList) => speciesList.filter((s) => s.evolves_from_species === null)),
    );
  }

  getAllBaseSpecies(): Observable<any[]> {
    if (this.baseSpeciesCache) {
      return new Observable<any[]>((observer) => {
        observer.next(this.baseSpeciesCache!);
        observer.complete();
      });
    }

    return this.http.get<{ results: { url: string }[] }>(`${this.SPECIES_API}?limit=2000`).pipe(
      switchMap((res) => forkJoin<any[]>(res.results.map((s) => this.http.get<any>(s.url)))),
      map((speciesList) => speciesList.filter((s) => s.evolves_from_species === null)),
      map((baseList) => {
        this.baseSpeciesCache = baseList;
        return baseList;
      }),
    );
  }

  getBasePokemons(page = 0, limit = 20): Observable<Pokemon[]> {
    const start = page * limit;
    const end = start + limit;

    return this.getAllBaseSpecies().pipe(
      map((allBaseSpecies) => allBaseSpecies.slice(start, end)),
      switchMap((speciesPage) =>
        forkJoin(
          speciesPage.map((species) =>
            this.http.get<any>(`${this.API}/${species.id}`).pipe(map((d) => this.toPokemon(d))),
          ),
        ),
      ),
    );
  }

  getEvolutionByPokemonId(id: number) {
    return this.getPokemonSpecies(id).pipe(
      switchMap((species) => this.getEvolutionChain(species.evolution_chain.url)),
      switchMap((chain) => this.parseEvolutionChain(chain.chain)),
    );
  }
}
