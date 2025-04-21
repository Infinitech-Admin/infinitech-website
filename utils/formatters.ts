export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
  }).format(number);
};

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const removeSpaces = (string: string) => {
  return string.replace(/ /g, "");
};