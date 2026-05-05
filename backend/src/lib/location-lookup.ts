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

  // Try exact village match first
  const villages = db.filter((e) => e.type === 'desa');

  // Try matching each search term
  for (const term of searchTerms) {
    const termNorm = normalizeName(term);
    if (!termNorm) continue;

    // Find desa that contains this term
    const match = villages.find((v) => {
      const vName = normalizeName(v.name);
      return vName.includes(termNorm) || termNorm.includes(vName);
    });

    if (match) return match.adm4;
  }

  // Try kecamatan level
  const kecamatans = db.filter((e) => e.type === 'kecamatan');
  for (const term of searchTerms) {
    const termNorm = normalizeName(term);
    if (!termNorm) continue;

    const match = kecamatans.find((k) => {
      const kName = normalizeName(k.name);
      return kName.includes(termNorm) || termNorm.includes(kName);
    });

    if (match) return match.adm4;
  }

  return null;
}

export function getAdm4FromLocation(locationName: string, hints: string[] = []): string | null {
  const candidates = [locationName, ...hints].map((value) => value.trim()).filter(Boolean);

  for (const candidate of candidates) {
    const adm4 = lookupAdm4Code(candidate);
    if (adm4) return adm4;

    const parts = candidate.split(',');
    if (parts.length >= 2) {
      const villageMatch = lookupAdm4Code(parts[0].trim());
      if (villageMatch) return villageMatch;
    }
  }

  return process.env.BMKG_ADM4_CODE || null;
}