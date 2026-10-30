/** Joins class names, skipping falsy ones: `cx(css.row, selected && css.selected)`. */
export const cx = (...names: (string | false | null | undefined)[]): string =>
  names.filter(Boolean).join(' ');
