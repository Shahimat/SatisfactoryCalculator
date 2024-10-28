export const restrictions = ['none', 'eq'] as const;
export type RestrictionType = (typeof restrictions)[number];
