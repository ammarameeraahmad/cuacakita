/**
 * Lokasi lookup service
 * Parses lokasi.md and finds ADM4 codes by matching village/subdistrict names
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

type LocationEntry = {
  adm4: string;
  name: string;
  type: 'provinsi' | 'kabupaten' | 'kecamatan' | 'desa';
};

let locationDb: LocationEntry[] | null = null;

// City name mappings for common locations that don't match BMKG database exactly
const CITY_MAPPINGS: Record<string, string[]> = {
  'yogyakarta': ['Sleman', 'Yogyakarta', 'Kota Yogyakarta', 'Mlati', 'Gamping', 'Depok'],
  'jogja': ['Sleman', 'Yogyakarta', 'Kota Yogyakarta', 'Mlati', 'Gamping', 'Depok'],
  'jogjakarta': ['Sleman', 'Yogyakarta', 'Kota Yogyakarta', 'Mlati', 'Gamping', 'Depok'],
  'daerah istimewa yogyakarta': ['Sleman', 'Yogyakarta', 'Kota Yogyakarta'],
  'diy': ['Sleman', 'Yogyakarta', 'Kota Yogyakarta'],
  'sleman': ['Sleman'],
  'bantul': ['Bantul'],
  'kulon progo': ['Kulon Progo', 'Wates'],
  'gunung kidul': ['Gunung Kidul'],
  'jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Gambir'],
  'bandung': ['Bandung'],
  'surabaya': ['Surabaya'],
  'semarang': ['Semarang'],
  'medan': ['Medan'],
  'makassar': ['Makassar'],
  'palembang': ['Palembang'],
  'denpasar': ['Denpasar'],
};

function parseLine(line: string): LocationEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d+(?:\.\d+)*),(.+)$/);
  if (!match) return null;

  const code = match[1];
  const name = match[2].trim();
  const parts = code.split('.');

  let type: LocationEntry['type'];
  if (parts.length === 1) type = 'provinsi';
  else if (parts.length === 2) type = 'kabupaten';
  else if (parts.length === 3) type = 'kecamatan';
  else if (parts.length === 4) type = 'desa';
  else return null;

  return { adm4: code, name, type };
}

function loadDatabase(): LocationEntry[] {
  if (locationDb) return locationDb;

  try {
    const filePath = resolve(process.cwd(), '../lokasi bmkg/lokasi.md');
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    locationDb = [];

    for (const line of lines) {
      const entry = parseLine(line);
      if (entry) locationDb.push(entry);
    }

    console.log(`[LocationLookup] Loaded ${locationDb.length} locations`);
  } catch (error) {
    console.error('[LocationLookup] Failed to load lokasi.md:', error);
    locationDb = [];
  }

  return locationDb;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFirstDesaCode(db: LocationEntry[], adm4: string): string {
  if (adm4.split('.').length === 4) return adm4;
  const desa = db.find(e => e.type === 'desa' && e.adm4.startsWith(adm4 + '.'));
  return desa ? desa.adm4 : adm4;
}

export function lookupAdm4Code(locationName: string): string | null {
  const db = loadDatabase();
  if (db.length === 0) return null;

  const normalized = normalizeName(locationName);
  const searchTerms = normalized.split(',').map((s) => s.trim()).filter(Boolean);

  if (searchTerms.length === 0) return null;

  const isYogyakartaQuery = searchTerms.some(term =>
    ['yogyakarta', 'jogja', 'jogjakarta', 'diy', 'daerah istimewa yogyakarta'].includes(normalizeName(term))
  ) || normalized.includes('yogyakarta') || normalized.includes('jogja');

  const allLevels = [
    { type: 'desa', items: db.filter(e => e.type === 'desa') },
    { type: 'kecamatan', items: db.filter(e => e.type === 'kecamatan') },
    { type: 'kabupaten', items: db.filter(e => e.type === 'kabupaten') }
  ];

  const priorityTerms = [searchTerms[0], ...searchTerms.slice(1)];

  for (const level of allLevels) {
    for (const term of priorityTerms) {
      const termNorm = normalizeName(term);
      if (!termNorm || termNorm.length < 3) continue;

      let matches = level.items.filter((k) => {
        const kName = normalizeName(k.name);
        return kName === termNorm || kName.includes(termNorm);
      });

      if (isYogyakartaQuery) {
        matches = matches.filter((k) => k.adm4.startsWith('34.'));
      }

      if (matches.length > 0) {
        return getFirstDesaCode(db, matches[0].adm4);
      }
    }
  }

  for (const term of priorityTerms) {
    const termNorm = normalizeName(term);
    if (!termNorm) continue;

    const mappedNames = CITY_MAPPINGS[termNorm];
    if (mappedNames) {
      for (const mappedName of mappedNames) {
        const mappedNormalized = normalizeName(mappedName);

        for (const level of allLevels) {
          let matches = level.items.filter((k) => {
            const kName = normalizeName(k.name);
            return kName === mappedNormalized || kName.includes(mappedNormalized);
          });

          if (isYogyakartaQuery) {
            matches = matches.filter((k) => k.adm4.startsWith('34.'));
          }

          if (matches.length > 0) {
            return getFirstDesaCode(db, matches[0].adm4);
          }
        }
      }
    }
  }

  return null;
}

export function getAdm4FromLocation(locationName: string, hints: string[] = []): string | null {
  const candidates = [locationName, ...hints].map((value) => value.trim()).filter(Boolean);

  console.log(`[LocationLookup] Looking up location: "${locationName}", hints: [${hints.join(', ')}]`);

  // Check if any hint indicates Yogyakarta
  const isYogyakartaContext = hints.some(hint =>
    ['yogyakarta', 'jogja', 'jogjakarta', 'diy', 'sleman', 'yogyakarta city', 'kota yogyakarta'].includes(
      normalizeName(hint)
    )
  );

  for (const candidate of candidates) {
    let adm4 = lookupAdm4Code(candidate);
    
    // If we found a match, verify it's in Yogyakarta context if applicable
    if (adm4 && isYogyakartaContext && !adm4.startsWith('34.')) {
      // Result is not in Yogyakarta, skip it and continue searching
      console.log(`[LocationLookup] Found ${adm4} but not in Yogyakarta context, skipping`);
      adm4 = null;
    }
    
    if (adm4) {
      console.log(`[LocationLookup] Found ADM4 ${adm4} for candidate: "${candidate}"`);
      return adm4;
    }

    const parts = candidate.split(',');
    if (parts.length >= 2) {
      const villageMatch = lookupAdm4Code(parts[0].trim());
      if (villageMatch) {
        // Same Yogyakarta context check
        if (isYogyakartaContext && !villageMatch.startsWith('34.')) {
          console.log(`[LocationLookup] Found ${villageMatch} but not in Yogyakarta context, skipping`);
          continue;
        }
        console.log(`[LocationLookup] Found ADM4 ${villageMatch} for village part: "${parts[0].trim()}"`);
        return villageMatch;
      }
    }
  }

  console.log('[LocationLookup] No match found');
  return null;
}