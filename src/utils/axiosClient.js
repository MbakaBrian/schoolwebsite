import axios from "axios";

// Create a base axios instance
const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token automatically to every request
axiosClient.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("authData");
    if (stored) {
      const { access } = JSON.parse(stored);
      if (access) config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Optional: auto-refresh token if expired (you can enable later)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and we haven’t retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const stored = localStorage.getItem("authData");
      if (stored) {
        const { refresh } = JSON.parse(stored);
        try {
          const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
            refresh,
          });
          const newAccess = res.data.access;

          // Update storage and headers
          const updated = { ...JSON.parse(stored), access: newAccess };
          localStorage.setItem("authData", JSON.stringify(updated));

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosClient(originalRequest); // retry request
        } catch (refreshError) {
          console.warn("Token refresh failed:", refreshError);
          localStorage.removeItem("authData");
          window.location.href = "/login"; // redirect to login
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
