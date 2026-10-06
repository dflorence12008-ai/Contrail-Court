import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Automatically attach login token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ===============================
// AUTH
// ===============================

export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};


// ===============================
// REAL AIRCRAFT DATA
// ===============================

export const getLiveAircraft = async (lat, lon, radius = 1) => {
  const response = await API.get("/external/aircraft", {
    params: {
      lat,
      lon,
      radius
    }
  });

  return response.data;
};


// ===============================
// REAL ATMOSPHERIC DATA
// ===============================

export const getWeatherData = async (lat, lon) => {
  const response = await API.get("/external/weather", {
    params: {
      lat,
      lon
    }
  });

  return response.data;
};


// ===============================
// INVESTIGATIONS
// ===============================

export const getStats = async () => {
  const response = await API.get("/investigations/stats");
  return response.data;
};

export const getInvestigations = async () => {
  const response = await API.get("/investigations");
  return response.data;
};

export const getInvestigation = async (id) => {
  const response = await API.get(`/investigations/${id}`);
  return response.data;
};

export const createInvestigation = async (data) => {
  const response = await API.post("/investigations", data);
  return response.data;
};

export const updateInvestigation = async (id, data) => {
  const response = await API.put(
    `/investigations/${id}`,
    data
  );

  return response.data;
};

export const deleteInvestigation = async (id) => {
  const response = await API.delete(
    `/investigations/${id}`
  );

  return response.data;
};


export default API;