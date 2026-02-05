export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  hidden: boolean;
}
export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  stats?: PokemonStat[];
  abilities?: PokemonAbility[];
}
