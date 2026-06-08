export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
export const serverUrl = (path) => path ? `${SERVER_URL}${path}` : null;
