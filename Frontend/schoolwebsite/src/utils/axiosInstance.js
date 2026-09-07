import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL ||
  "https://api.peppercornpremierschools.sc.ke/api/";

const axiosInstance = axios.create({ baseURL });

function getAuthData() {
  const raw = localStorage.getItem("authData");

  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuthData(next) {
  localStorage.setItem("authData", JSON.stringify(next));
}

function clearAuthAndRedirect() {
  localStorage.removeItem("authData");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// --------------------------------------------------
// ATTACH ACCESS TOKEN
// --------------------------------------------------

axiosInstance.interceptors.request.use(
  (config) => {
    const auth = getAuthData();

    if (auth?.access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${auth.access}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------------------------------
// TOKEN REFRESH
// --------------------------------------------------

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  pendingQueue = [];
}

// --------------------------------------------------
// RESPONSE INTERCEPTOR
// --------------------------------------------------

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // Only handle 401 responses
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry the same request infinitely
    if (original?._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh while already dealing with login/token endpoints
    const requestUrl = original?.url || "";

    if (
      requestUrl.includes("token/") ||
      requestUrl.includes("login")
    ) {
      return Promise.reject(error);
    }

    const auth = getAuthData();

    // No refresh token = user is not authenticated
    if (!auth?.refresh) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // --------------------------------------------------
    // Another request is already refreshing
    // --------------------------------------------------

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve,
          reject,
        });
      }).then((newAccess) => {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;

        return axiosInstance(original);
      });
    }

    // --------------------------------------------------
    // Start refresh
    // --------------------------------------------------

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${baseURL}token/refresh/`,
        {
          refresh: auth.refresh,
        }
      );

      const updatedAuth = {
        ...auth,
        access: data.access,
      };

      setAuthData(updatedAuth);

      resolveQueue(null, data.access);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${data.access}`;

      return axiosInstance(original);

    } catch (refreshError) {
      resolveQueue(refreshError, null);

      clearAuthAndRedirect();

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;