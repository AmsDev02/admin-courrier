import axios from "axios";

const API_URL = "http://localhost:8000/api/core/categories/";

// Récupération du token (DRF TokenAuth)
const token = localStorage.getItem("auth_token");

const config = {
  headers: {
    Authorization: token ? `Token ${token}` : "",
    "Content-Type": "application/json",
  },
};

// ----------------------------
// CATEGORIES
// ----------------------------

// Liste des catégories
export const getCategories = async () => {
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Créer une catégorie
export const createCategory = async (data) => {
  const response = await axios.post(API_URL, data, config);
  return response.data;
};

// Mettre à jour une catégorie
export const updateCategory = async (id, data) => {
  const response = await axios.put(`${API_URL}${id}/`, data, config);
  return response.data;
};

// Supprimer une catégorie
export const deleteCategory = async (id) => {
  const response = await axios.delete(`${API_URL}${id}/`, config);
  return response.data;
};
