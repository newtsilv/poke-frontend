import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../../services/pokemon.service';
import { Pokemon } from '../../models/pokemon.module';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-section.html',
})
export class HomeComponent {
  pokemons = signal<Pokemon[]>([]);
  page = signal(0);
  limit = 20;

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private pokemonService: PokemonService) {
    effect(() => {
      this.loadPokemons();
    });
  }

  loadPokemons() {
    this.loading.set(true);
    this.error.set(null);

    this.pokemonService.getPokemons(this.page(), this.limit).subscribe({
      next: (data: Pokemon[]) => {
        this.pokemons.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar pokémons');
        this.loading.set(false);
      },
    });
  }

  nextPage() {
    this.page.update((p) => p + 1);
  }

  prevPage() {
    this.page.update((p) => Math.max(p - 1, 0));
  }
}
