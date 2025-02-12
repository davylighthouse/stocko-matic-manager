
export const parsePrice = (value: string | undefined): number => {
  if (!value || value.trim() === '') return 0;
  const cleanValue = value.trim().replace('£', '');
  const number = parseFloat(cleanValue);
  return isNaN(number) ? 0 : number;
};
