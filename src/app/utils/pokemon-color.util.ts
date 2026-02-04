export function getPokemonBgClass(types: string[]): string {
  if (types.includes('fire')) return '#F57D31';
  if (types.includes('grass') || types.includes('bug')) return '#74CB48';
  if (types.includes('water')) return '#6493EB';
  if (types.includes('electric')) return '#F9CF30';
  if (types.includes('poison')) return '#A43E9E';
  if (types.includes('ground')) return '#DEC16B';
  if (types.includes('fairy')) return '#E69EAC';

  return '#AAA67F';
}
