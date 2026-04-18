import { PHONE_REGEX, STORAGE_KEYS } from './constants';

export const toUpperCase = (value: string): string => {
  return value.toUpperCase();
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('256')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+256${cleaned.slice(1)}`;
  if (cleaned.length === 9) return `+256${cleaned}`;
  return phone;
};

export const validateUgandaPhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return PHONE_REGEX.test(cleaned);
};

export const generateRegistrationID = (): string => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MJS-${yy}${mm}${dd}-${hh}${min}${ss}-${suffix}`;
};

export const generateGuardianID = (): string => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `G${yy}${mm}${dd}${hh}${min}${ss}${suffix}`;
};

export const validateField = (name: string, value: any, allData?: any): string => {
  if (!value && !name.includes('optional')) {
    if (name.includes('first_name') || name.includes('last_name') || 
        name.includes('section') || name.includes('class.name') ||
        name.includes('gender') || name.includes('date_of_birth')) {
      return 'This field is required';
    }
  }

  if (name.includes('contact') && value) {
    if (!validateUgandaPhone(value)) {
      return 'Please enter a valid phone number';
    }
  }

  if (name.includes('nin') && value && value.length < 10) {
    return 'NIN should be at least 10 characters';
  }

  return '';
};

export const saveDraft = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_DRAFT, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

export const loadDraft = () => {
  try {
    const draft = localStorage.getItem(STORAGE_KEYS.REGISTRATION_DRAFT);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
};

export const clearDraft = () => {
  localStorage.removeItem(STORAGE_KEYS.REGISTRATION_DRAFT);
};