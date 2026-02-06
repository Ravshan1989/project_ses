import axios from 'axios';
import { API_BASE_URL } from '../config';

const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
});

export const sosService = {
    getDiseases: async () => {
        const response = await axios.get(`${API_BASE_URL}/sos/diseases`, getHeaders());
        return response.data;
    },

    createDisease: async (data: any) => {
        const response = await axios.post(`${API_BASE_URL}/sos/diseases`, data, getHeaders());
        return response.data;
    },

    deleteDisease: async (id: string) => {
        const response = await axios.delete(`${API_BASE_URL}/sos/diseases/${id}`, getHeaders());
        return response.data;
    },

    createAlert: async (data: any) => {
        const response = await axios.post(`${API_BASE_URL}/sos/alerts`, data, getHeaders());
        return response.data;
    },

    getAlerts: async () => {
        const response = await axios.get(`${API_BASE_URL}/sos/alerts`, getHeaders());
        return response.data;
    },

    markAsReviewed: async (id: string) => {
        const response = await axios.patch(`${API_BASE_URL}/sos/alerts/${id}/review`, {}, getHeaders());
        return response.data;
    },
};
