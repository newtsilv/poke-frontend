export interface PokemonSpecies {
  id: number;
  evolves_from_species: { name: string; url: string } | null;
}
