import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../../services/pokemon.service';
import { Pokemon } from '../../models/pokemon.module';
import { MatDialog } from '@angular/material/dialog';
import { EvolutionModal } from '../evolution-modal/evolution-modal';
import { getPokemonBgClass } from '../../utils/pokemon-color.util';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-section.html',
})

export class HomeSectionComponent {
  pokemons = signal<Pokemon[]>([]);
  page = signal(0);
  limit = 20;
  selectedPokemon = signal<Pokemon | null>(null);
  evolutions = signal<Pokemon[]>([]);
  modalOpen = signal(false);

  getPokemonBgClass = getPokemonBgClass;


  loading = signal(false);
  error = signal<string | null>(null);


  constructor(
    private pokemonService: PokemonService,
    private dialog: MatDialog,
  ) {
    effect(() => {
      this.loadPokemons();
    });
  }

  loadPokemons() {
    this.loading.set(true);
    this.error.set(null);

    this.pokemonService.getBasePokemons(this.page(), this.limit).subscribe({
      next: (data) => {
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

  openEvolutionModal(pokemon: Pokemon) {
    this.pokemonService.getEvolutionByPokemonId(pokemon.id).subscribe((evolutions) => {
      this.dialog.open(EvolutionModal, {
        width: '400px',
        data: { evolutions },
      });
    });
  }

  closeModal() {
    this.modalOpen.set(false);
    this.selectedPokemon.set(null);
    this.evolutions.set([]);
  }
}
