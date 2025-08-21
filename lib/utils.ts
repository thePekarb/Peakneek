// DMS "48°51'46.0"N 43°36'19.1"E" -> decimal
export function parseDMS(input: string): { lat: number; lng: number } | null {
  const s = input.trim().replace(/\s+/g, " ");
  const re1 =
    /(\d+)[°:\s](\d+)['’:\s](\d+(?:\.\d+)?)["”]?\s*([NS])[,;\s]+(\d+)[°:\s](\d+)['’:\s](\d+(?:\.\d+)?)["”]?\s*([EW])/i;
  const re2 = /([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)/;

  let m = s.match(re1);
  if (m) {
    const dms = (d: number, mn: number, sc: number) => d + mn / 60 + sc / 3600;
    let lat = dms(+m[1], +m[2], +m[3]);
    let lng = dms(+m[5], +m[6], +m[7]);
    if (/s/i.test(m[4])) lat = -lat;
    if (/w/i.test(m[8])) lng = -lng;
    return { lat, lng };
  }
  m = s.match(re2);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}
