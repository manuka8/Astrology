import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to include the JWT token in all requests
API.interceptors.request.use((req) => {
    const storedUser = localStorage.getItem('astroUser');
    if (storedUser) {
        const { token } = JSON.parse(storedUser);
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const loginApi = (formData) => API.post('/auth/login', formData);
export const registerApi = (formData) => API.post('/auth/register', formData);
export const getUsersApi = () => API.get('/users');
export const updateUserRoleApi = (id, role) => API.put(`/users/${id}/role`, { role });
export const updateProfileApi = (formData) => API.put('/users/profile', formData);
export const createHoroscopeApi = (formData) => API.post('/horoscopes', formData);
export const getHoroscopesApi = () => API.get('/horoscopes');

export default API;
