// src/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const get = async (endpoint, token) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
  return res.json();
};

export const post = async (endpoint, data, token) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: data, // FormData for files, JSON.stringify() for JSON
  });
  return res.json();
};

export const del = async (endpoint, token) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
  return res.json();
};
