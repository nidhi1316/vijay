/**
 * Input Validation Utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidCitizenId = (id: string): boolean => {
  return id.trim().length >= 4;
};

export const isNotEmpty = (val: string): boolean => {
  return val.trim().length > 0;
};
