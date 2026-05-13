export const sanitiseNextPath = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
};
