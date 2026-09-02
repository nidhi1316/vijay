/**
 * Image Helper Utilities
 */

export const getCleanImageSource = (source: any) => {
  if (!source) return undefined;
  if (typeof source === 'string') {
    return { uri: source };
  }
  return source;
};

export const isValidImageUri = (uri?: string): boolean => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:');
};
