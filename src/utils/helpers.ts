/**
 * Common Helper Functions
 */

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


// kundan gupta
