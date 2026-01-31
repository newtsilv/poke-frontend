import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Pokemon } from '../../src/app/models/pokemon.module';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private API = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getPokemonSpecies(id: number) {
    return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  }

  getEvolutionChain(url: string) {
    return this.http.get<any>(url);
  }

  getPokemons(page = 0, limit = 20): Observable<Pokemon[]> {
    const offset = page * limit;

    return this.http.get<any>(`${this.API}?offset=${offset}&limit=${limit}`).pipe(
      switchMap((res) =>
        forkJoin<Pokemon[]>(
          res.results.map((p: any) =>
            this.http.get<any>(p.url).pipe(
              map(
                (detail): Pokemon => ({
                  id: detail.id,
                  name: detail.name,
                  image: detail.sprites.other['official-artwork'].front_default,
                  types: detail.types.map((t: any) => t.type.name),
                }),
              ),
            ),
          ),
        ),
      ),
      map((pokemons) => [...pokemons].sort((a, b) => a.id - b.id)),
    );
  }
}
