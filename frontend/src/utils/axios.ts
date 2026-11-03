import axios from "axios";

const getBackendEndpoint = (): string => {
  if (typeof window !== "undefined" && window.APP_CONFIG) {
    return window.APP_CONFIG.BACKEND_ENDPOINT;
  }
  return "http://localhost:3000";
};

export const axiosInstance = axios.create({
  baseURL: `${getBackendEndpoint()}/`,
  // withCredentials: true,
});