import { Pokemon } from './pokemon.module';

export interface EvolutionDialogData {
  evolutions: Pokemon[];
  loading: boolean;
}
