import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
    const stored = localStorage.getItem('astroUser');
    if (stored) {
        const { token } = JSON.parse(stored);
        if (token) req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('astroUser');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);
export const getMeApi = () => API.get('/auth/me');
export const updateProfileApi = (data) => API.put('/auth/profile', data);
export const changePasswordApi = (data) => API.put('/auth/change-password', data);
export const forgotPasswordApi = (data) => API.post('/auth/forgot-password', data);
export const resetPasswordApi = (data) => API.post('/auth/reset-password', data);

// Family Members
export const getMembersApi = () => API.get('/members');
export const getMemberApi = (id) => API.get(`/members/${id}`);
export const createMemberApi = (data) => API.post('/members', data);
export const updateMemberApi = (id, data) => API.put(`/members/${id}`, data);
export const deleteMemberApi = (id) => API.delete(`/members/${id}`);
export const uploadMemberHoroscopeApi = (id, data) => API.post(`/members/${id}/upload-horoscope`, data);

// Horoscopes
export const getHoroscopesApi = () => API.get('/horoscopes');
export const getHoroscopeApi = (id) => API.get(`/horoscopes/${id}`);
export const createHoroscopeApi = (data) => API.post('/horoscopes', data);
export const updateHoroscopeApi = (id, data) => API.put(`/horoscopes/${id}`, data);
export const deleteHoroscopeApi = (id) => API.delete(`/horoscopes/${id}`);

// Horoscope Matching
export const getMatchesApi = () => API.get('/matching');
export const createMatchApi = (data) => API.post('/matching', data);
export const deleteMatchApi = (id) => API.delete(`/matching/${id}`);

// Predictions
export const getPredictionsApi = (type) => API.get(`/predictions${type ? `?type=${type}` : ''}`);
export const generatePredictionApi = (data) => API.post('/predictions/generate', data);
export const getPredictionUsageApi = () => API.get('/predictions/usage');

// Membership
export const getPlansApi = () => API.get('/membership/plans');
export const subscribeApi = (data) => API.post('/membership/subscribe', data);
export const getMySubscriptionsApi = () => API.get('/membership/my-subscriptions');
export const getAdminPlansApi = () => API.get('/membership/admin/plans');
export const createPlanApi = (data) => API.post('/membership/admin/plans', data);
export const updatePlanApi = (id, data) => API.put(`/membership/admin/plans/${id}`, data);
export const deletePlanApi = (id) => API.delete(`/membership/admin/plans/${id}`);
export const getAllSubscriptionsApi = () => API.get('/membership/admin/subscriptions');

// Notifications
export const getNotificationsApi = () => API.get('/notifications');
export const markNotificationReadApi = (id) => API.put(`/notifications/${id}/read`);
export const broadcastNotificationApi = (data) => API.post('/notifications/broadcast', data);

// Admin Users
export const getUsersApi = (params) => API.get('/users', { params });
export const getUserApi = (id) => API.get(`/users/${id}`);
export const createUserApi = (data) => API.post('/users', data);
export const updateUserApi = (id, data) => API.put(`/users/${id}`, data);
export const deleteUserApi = (id) => API.delete(`/users/${id}`);
export const resetUserPasswordApi = (id, data) => API.post(`/users/${id}/reset-password`, data);
export const getStatsApi = () => API.get('/users/stats');

// Articles
export const getArticlesApi = (params) => API.get('/articles', { params });
export const getArticleApi = (id) => API.get(`/articles/${id}`);
export const createArticleApi = (data) => API.post('/articles', data);
export const updateArticleApi = (id, data) => API.put(`/articles/${id}`, data);
export const deleteArticleApi = (id) => API.delete(`/articles/${id}`);

// Contact
export const submitContactApi = (data) => API.post('/contact', data);
export const getContactsApi = () => API.get('/contact');

// Expert System — Public discovery
export const browseExpertsApi = (params) => API.get('/experts/browse', { params });
export const getExpertPublicProfileApi = (id) => API.get(`/experts/profile/${id}`);

// Expert System — Public
export const submitExpertApplicationApi = (data) => API.post('/experts/apply', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const checkExpertStatusApi = (email) => API.get('/experts/status', { params: { email } });
export const loginTempAccountApi = (data) => API.post('/experts/temp-login', data);
export const getTempApplicationApi = (token) => API.get('/experts/temp-application', { params: { token } });

// Expert System — User
export const createExpertRequestApi = (data) => API.post('/experts/requests', data);
export const getMyExpertRequestsApi = () => API.get('/experts/requests/my');
export const getMyExpertRequestApi = (id) => API.get(`/experts/requests/my/${id}`);
export const cancelExpertRequestApi = (id) => API.delete(`/experts/requests/my/${id}`);

// Expert System — Expert role
export const getExpertQueueApi = () => API.get('/experts/queue');
export const acceptExpertRequestApi = (id) => API.post(`/experts/requests/${id}/accept`);
export const submitExpertReviewApi = (id, data) => API.put(`/experts/requests/${id}/review`, data);
export const getMyExpertWorkApi = () => API.get('/experts/my-work');
export const getMyExpertProfileApi = () => API.get('/experts/my-profile');
export const updateMyExpertProfileApi = (data) => API.put('/experts/my-profile', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
});

// Expert System — Admin
export const getExpertApplicationsApi = (params) => API.get('/experts/applications', { params });
export const approveExpertApplicationApi = (id) => API.put(`/experts/applications/${id}/approve`);
export const rejectExpertApplicationApi = (id, data) => API.put(`/experts/applications/${id}/reject`, data);
export const getExpertsListApi = () => API.get('/experts/list');
export const getAllExpertRequestsApi = (params) => API.get('/experts/all-requests', { params });

// Roles & Permissions
export const getRolesApi = () => API.get('/roles');
export const createRoleApi = (data) => API.post('/roles', data);
export const updateRoleApi = (id, data) => API.put(`/roles/${id}`, data);
export const deleteRoleApi = (id) => API.delete(`/roles/${id}`);
export const getPermissionsApi = () => API.get('/roles/permissions');
export const getRolePermissionsApi = (id) => API.get(`/roles/${id}/permissions`);
export const setRolePermissionsApi = (id, data) => API.put(`/roles/${id}/permissions`, data);
export const getUsersWithRolesApi = (params) => API.get('/roles/users/list', { params });
export const assignUserRoleApi = (userId, data) => API.put(`/roles/assign-user/${userId}`, data);

export default API;
