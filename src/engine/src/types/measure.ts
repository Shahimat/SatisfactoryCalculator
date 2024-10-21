export const streamMeasures = ['ipm', 'm3pm', 'MW'] as const;
export const measures = [...streamMeasures, 'items', 'm3', 'MJ'] as const;
export type MeasureType = (typeof measures)[number];
export type StreamMeasureType = (typeof streamMeasures)[number];
