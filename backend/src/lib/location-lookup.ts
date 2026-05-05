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

export function lookupAdm4Code(locationName: string): string | null {
  const db = loadDatabase();
  if (db.length === 0) return null;

  const normalized = normalizeName(locationName);
  const searchTerms = normalized.split(',').map((s) => s.trim()).filter(Boolean);

  if (searchTerms.length === 0) return null;

  // For Yogyakarta-related searches, prioritize Yogyakarta province (34)
  // Check both individual terms and the full location string
  const isYogyakartaQuery = searchTerms.some(term =>
    ['yogyakarta', 'jogja', 'jogjakarta', 'diy', 'daerah istimewa yogyakarta'].includes(normalizeName(term))
  ) || normalized.includes('yogyakarta') || normalized.includes('jogja');

  // Try kecamatan level first (prefer districts over villages)
  const kecamatans = db.filter((e) => e.type === 'kecamatan');

  // Prioritize the first term (usually the most specific location)
  const priorityTerms = [searchTerms[0], ...searchTerms.slice(1)];

  for (const term of priorityTerms) {
    const termNorm = normalizeName(term);
    if (!termNorm) continue;

    // For Yogyakarta queries, prioritize Yogyakarta province kecamatans
    let matches = kecamatans.filter((k) => {
      const kName = normalizeName(k.name);
      return kName.includes(termNorm) || termNorm.includes(kName);
    });

    if (isYogyakartaQuery) {
      matches = matches.filter((k) => k.adm4.startsWith('34.'));
    }

    if (matches.length > 0) {
      // Return the first match (prioritize Yogyakarta province if applicable)
      return matches[0].adm4;
    }
  }

  // Try village level
  const villages = db.filter((e) => e.type === 'desa');
  for (const term of priorityTerms) {
    const termNorm = normalizeName(term);
    if (!termNorm) continue;

    // For Yogyakarta queries, prioritize Yogyakarta province villages
    let matches = villages.filter((v) => {
      const vName = normalizeName(v.name);
      return vName.includes(termNorm) || termNorm.includes(vName);
    });

    if (isYogyakartaQuery) {
      matches = matches.filter((v) => v.adm4.startsWith('34.'));
    }

    if (matches.length > 0) {
      // Return the first match (prioritize Yogyakarta province if applicable)
      return matches[0].adm4;
    }
  }

  // Try city mappings for common cities
  for (const term of priorityTerms) {
    const termNorm = normalizeName(term);
    if (!termNorm) continue;

    const mappedNames = CITY_MAPPINGS[termNorm];
    if (mappedNames) {
      for (const mappedName of mappedNames) {
        const mappedNormalized = normalizeName(mappedName);

        // Try kecamatans first for mapped names
        let kecamatanMatches = kecamatans.filter((k) => {
          const kName = normalizeName(k.name);
          return kName.includes(mappedNormalized) || mappedNormalized.includes(kName);
        });

        if (isYogyakartaQuery) {
          kecamatanMatches = kecamatanMatches.filter((k) => k.adm4.startsWith('34.'));
        }

        if (kecamatanMatches.length > 0) {
          return kecamatanMatches[0].adm4;
        }

        // Try villages for mapped names
        let villageMatches = villages.filter((v) => {
          const vName = normalizeName(v.name);
          return vName.includes(mappedNormalized) || mappedNormalized.includes(vName);
        });

        if (isYogyakartaQuery) {
          villageMatches = villageMatches.filter((v) => v.adm4.startsWith('34.'));
        }

        if (villageMatches.length > 0) {
          return villageMatches[0].adm4;
        }
      }
    }
  }

  return null;
}

export function getAdm4FromLocation(locationName: string, hints: string[] = []): string | null {
  const candidates = [locationName, ...hints].map((value) => value.trim()).filter(Boolean);

  console.log(`[LocationLookup] Looking up location: "${locationName}", hints: [${hints.join(', ')}]`);

  for (const candidate of candidates) {
    const adm4 = lookupAdm4Code(candidate);
    if (adm4) {
      console.log(`[LocationLookup] Found ADM4 ${adm4} for candidate: "${candidate}"`);
      return adm4;
    }

    const parts = candidate.split(',');
    if (parts.length >= 2) {
      const villageMatch = lookupAdm4Code(parts[0].trim());
      if (villageMatch) {
        console.log(`[LocationLookup] Found ADM4 ${villageMatch} for village part: "${parts[0].trim()}"`);
        return villageMatch;
      }
    }
  }

  console.log(`[LocationLookup] No match found, using fallback: ${process.env.BMKG_ADM4_CODE || '31.71.01.1001'}`);
  return process.env.BMKG_ADM4_CODE || '31.71.01.1001'; // Default to Gambir if nothing found
}