// App-wide date display uses DD/MM/YYYY, not the locale-dependent default
// (which renders M/D/YYYY for US-locale devices — ambiguous for most of our
// users outside the US).
export const formatDate = (value: string | number | Date): string => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
