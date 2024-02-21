import { CARD_GAP, CARD_HEIGHT, CARD_WIDTH } from 'models/constants/card-size';

export const calcCardWidth = (size: number) =>
  `${size * CARD_WIDTH + (size - 1) * CARD_GAP}rem`;

export const calcCardHeight = (size: number) =>
  `${size * CARD_HEIGHT + (size - 1) * CARD_GAP}rem`;
