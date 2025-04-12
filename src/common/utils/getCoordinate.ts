import fetch from "node-fetch";

const defaultCoordinates = { latitude: 16.0471648, longitude: 108.1655063 };

export const getCoordinates = async (shortUrl: string): Promise<{ latitude: number, longitude: number }> => {
  try {
    let finalUrl = shortUrl.trim();
    if (finalUrl.includes('maps.app.goo.gl')) {
      finalUrl = await resolveShortUrl(finalUrl);
    }
    
    return extractLatLngFromMapUrl(finalUrl);
  } catch (err) {
    console.error('Lỗi khi xử lý URL:', err);
    return defaultCoordinates;
  }
};
async function resolveShortUrl(shortUrl: string) {
  const res = await fetch(shortUrl, {
    method: "GET",
    redirect: "follow",
  });
  return res.url;
}
function extractLatLngFromMapUrl(url: string): {
  latitude: number;
  longitude: number;
} {
  const cleanUrl = decodeURIComponent(url.trim());

  const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const atMatch = cleanUrl.match(atRegex);
  if (atMatch) {
    const latitude = parseFloat(atMatch[1]);
    const longitude = parseFloat(atMatch[2]);
    if (isValidCoordinate(latitude, longitude)) return { latitude, longitude };
  }

  const searchRegex = /\/search\/(-?\d+\.\d+)[,\s\+]*(-?\d+\.\d+)/;
  const searchMatch = cleanUrl.match(searchRegex);
  if (searchMatch) {
    const latitude = parseFloat(searchMatch[1]);
    const longitude = parseFloat(searchMatch[2]);
    if (isValidCoordinate(latitude, longitude)) return { latitude, longitude };
    return defaultCoordinates;
  }

  const queryRegex = /[?&]lat=(-?\d+\.\d+)[&]lng=(-?\d+\.\d+)/;
  const queryMatch = cleanUrl.match(queryRegex);
  if (queryMatch) {
    const latitude = parseFloat(queryMatch[1]);
    const longitude = parseFloat(queryMatch[2]);
    if (isValidCoordinate(latitude, longitude)) return { latitude, longitude };
  }
  return defaultCoordinates;
}

function isValidCoordinate(lat: number, lng: number) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
