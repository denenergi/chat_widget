import axios from "axios";

const BASE_DOMAIN_URL = process.env.REACT_APP_JD_DOMAIN_URL;

const axiosInstance = axios.create({
  baseURL: BASE_DOMAIN_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response.data.errors)
);

export default axiosInstance;
