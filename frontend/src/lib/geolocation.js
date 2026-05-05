/**
 * Browser Geolocation Utility
 * Meminta izin lokasi pengguna dan melakukan reverse geocoding
 * menggunakan OpenStreetMap Nominatim (GRATIS, tidak perlu API key)
 */

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung di browser ini'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = 'Gagal mendapatkan lokasi';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            message = 'Waktu permintaan lokasi habis.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // cache 5 menit
        ...options,
      }
    );
  });
}

/**
 * Reverse geocode menggunakan OpenStreetMap Nominatim API
 * GRATIS - hanya perlu user-agent yang jelas
 */
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=id`;

  // Create an AbortController with a 10-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'ClimSight/1.0 (weather-app-hackathon)',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Reverse geocode gagal (${response.status})`);
  }

  const data = await response.json();

  const address = data.address || {};
  const components = {
    village: address.village || address.hamlet || address.suburb || address.town || '',
    district: address.county || address.city_district || '',
    city: address.city || address.municipality || '',
    regency: address.state_district || '',
    province: address.state || '',
    country: address.country || '',
    displayName: data.display_name || '',
  };

  // Build location label: prioritaskan desa/kelurahan, lalu kecamatan
  const parts = [
    components.village,
    components.district,
    components.city || components.regency,
  ].filter(Boolean);
  const locationLabel = parts.length > 0
    ? parts.slice(0, 2).join(', ')
    : components.province || 'Lokasi Tidak Diketahui';

  // Build ADM4 code approximation from village name (untuk BMKG lookup)
  const adm4Hint = components.village || components.district || components.city || '';

  return {
    lat,
    lng,
    ...components,
    locationLabel,
    adm4Hint,
  };
}