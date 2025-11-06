import { API_BASE } from '../config.js';

export function handleImageUrl(response_url) {
    return response_url.startsWith('/') ? `${API_BASE}${response_url}` : `${API_BASE}/${response_url}`;
}