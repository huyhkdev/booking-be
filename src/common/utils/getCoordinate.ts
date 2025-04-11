import axios from 'axios';
const defaultCoordinates = { latitude: 16.0471648, longitude: 108.1655063 };
export const getCoordinates = async (shortUrl: string) => {
  try {
    const response = await axios.get(shortUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302,
    });
    const fullUrl = response.headers.location;
    const regex = /search\/([-+]?\d*\.\d+|\d+),([-+]?\d*\.\d+|\d+)/;
    const match = fullUrl.match(regex);
    if (match) {
      let latitude = match[1];
      let longitude = match[2];
      if (latitude.startsWith('+')) latitude = latitude.slice(1);
      if (longitude.startsWith('+')) longitude = longitude.slice(1);
      return { latitude, longitude };
    } else {
      return defaultCoordinates;
    }
  } catch (error) {
    return defaultCoordinates;
  }
};