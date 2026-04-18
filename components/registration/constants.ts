import { Relationship, Region } from './types';

export const CLASS_OPTIONS_MAP = {
  'Day Care': ['Infant', 'Toddler', 'Pre-Nursery'],
  'Pre-Primary': ['Pre A', 'Pre B', 'Pre C'],
  'Primary': ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7']
} as const;

export const STREAM_OPTIONS_MAP = {
  'Day Care': [],
  'Pre-Primary': ['1', '2', '3'],
  'Primary': ['Apple', 'Lemon', 'Orange']
} as const;

export const HOUSE_OPTIONS = ['Day', 'Boarding'];
export const RELIGION_OPTIONS = ['Christianity', 'Islam', 'Hindu', 'Other'];
export const RELATIONSHIP_OPTIONS: Relationship[] = ['Mother', 'Father', 'Guardian', 'Sibling', 'Relative', 'Other'];
export const REGIONS: Region[] = ['Central', 'Eastern', 'Western', 'Northern'];

export const CLOUDINARY_CONFIG = {
  UPLOAD_PRESET: 'mjs-admission-photos',
  CLOUD_NAME: 'dzidperyt',
  URL: 'https://api.cloudinary.com/v1_1/dzidperyt/image/upload'
} as const;

export const STORAGE_KEYS = {
  REGISTRATION_DRAFT: 'mjs_registration_draft'
} as const;

export const PHONE_REGEX = /^(?:\+256|0)?[7|3|2]\d{8}$/;