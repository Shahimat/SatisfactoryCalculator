import { CardGroupVariantEnum, CardVariantEnum } from './card-variant.enum';

export interface ICardTableNotation {
  cardGroups: ICardGroupNotation[];
}

export interface ICardGroupNotation {
  cards: ICardNotation[];
  variant?: CardGroupVariantEnum;
}

export interface ICardNotation {
  cardType?: CardVariantEnum;
  title?: string;
  icon?: string;
  link?: string;
  value?: string;
  measure?: string;
}
