
export const getPlatformColor = (platform: string, promoted: boolean) => {
  if (platform.toLowerCase() !== 'ebay') return '';
  return promoted ? 'text-red-600 font-medium' : 'text-green-600 font-medium';
};
