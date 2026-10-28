import { readFileSync } from 'node:fs';

export type DocsClass = Record<string, unknown> & { ClassName: string };

/** Game docs grouped by native class short name, e.g. `FGRecipe`. */
export type GameDocs = Map<string, DocsClass[]>;

type DocsGroup = { NativeClass: string; Classes: DocsClass[] };

export const readGameDocs = (path: string): GameDocs => {
  const text = readFileSync(path).toString('utf16le');
  const BOM = 0xfe_ff;
  const json = text.codePointAt(0) === BOM ? text.slice(1) : text;
  const groups = JSON.parse(json) as DocsGroup[];
  return new Map(
    groups.map((group) => [nativeClassName(group.NativeClass), group.Classes]),
  );
};

const nativeClassName = (nativeClass: string): string =>
  nativeClass.slice(nativeClass.lastIndexOf('.') + 1).replace(/'$/, '');

export const field = (docsClass: DocsClass, name: string): string => {
  const value = docsClass[name];
  if (typeof value !== 'string') {
    throw new TypeError(
      `${docsClass.ClassName}: field ${name} is not a string`,
    );
  }
  return value;
};

export const numberField = (docsClass: DocsClass, name: string): number => {
  const value = Number(field(docsClass, name));
  if (Number.isNaN(value)) {
    throw new TypeError(
      `${docsClass.ClassName}: field ${name} is not a number`,
    );
  }
  return value;
};

export const booleanField = (docsClass: DocsClass, name: string): boolean =>
  field(docsClass, name) === 'True';

/** Parses `((ItemClass="…/Desc_X.Desc_X_C'",Amount=3),…)` into class names with raw amounts. */
export const parseItemAmounts = (
  value: string,
): { item: string; amount: number }[] =>
  [...value.matchAll(/ItemClass="[^"]*?\.(\w+)'",Amount=([\d.]+)/g)].map(
    ([, item, amount]) => ({ item: item ?? '', amount: Number(amount) }),
  );

/** Extracts blueprint class names (`…/Build_X.Build_X_C`) from a game class list. */
export const parseClassList = (value: string): string[] =>
  [...value.matchAll(/\.(\w+_C)\b/g)].map(([, name]) => name ?? '');

export const parseEnumList = (value: string): string[] =>
  value.replace(/[()]/g, '').split(',').filter(Boolean);

export const iconPath = (value: string): string =>
  value.replace(/^Texture2D /, '');
