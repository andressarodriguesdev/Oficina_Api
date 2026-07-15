/**
 * API client configured to consume a .NET REST API.
 * Replace MOCK_MODE = false and set VITE_API_URL to point to the real backend.
 */
import axios from 'axios';

export const apiClient = axios.create({
baseURL: 'https://localhost:7201/api'
,
headers: {

'Content-Type': 'application/json'

}

});

export const MOCK_MODE = false;

