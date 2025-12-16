// src/services/serviceService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/core";

// ----------------------------
// INSTANCE AXIOS
// ----------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ----------------------------
// Gestion du Token (AUTHTOKEN)
// ----------------------------
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Charger automatiquement le token si présent
const existingToken = localStorage.getItem("auth_token");
if (existingToken) setAuthToken(existingToken);

// ----------------------------
// SERVICES (CRUD)
// ----------------------------
export const getServices = async () => {
  const res = await api.get("/services/");
  return res.data;
};

export const getServiceById = async (id) => {
  const res = await api.get(`/services/${id}/`);
  return res.data;
};

export const createService = async (data) => {
  const res = await api.post("/services/", data);
  return res.data;
};

export const updateService = async (id, data) => {
  const res = await api.put(`/services/${id}/`, data);
  return res.data;
};

export const deleteService = async (id) => {
  const res = await api.delete(`/services/${id}/`);
  return res.data;
};

export default api;
