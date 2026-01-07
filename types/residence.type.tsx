export type Region = 'North' | 'East' | 'West' | 'South';

export const DISTRICT_BY_REGION: Record<Region, readonly string[]> = {
    'North': [],
    'East': [],
    'West': [],
    'South': [],
} as const;

