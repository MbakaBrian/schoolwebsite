import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL ||
  "https://api.peppercornpremierschools.sc.ke/api/";

const axiosInstance = axios.create({
  baseURL,
});


// ============================================================
// AUTH HELPERS
// ============================================================

function getAuthData() {
  const raw = localStorage.getItem("authData");

  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


function setAuthData(next) {
  localStorage.setItem(
    "authData",
    JSON.stringify(next)
  );
}


function clearAuthAndRedirect() {
  localStorage.removeItem("authData");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}


// ============================================================
// ATTACH ACCESS TOKEN
// ============================================================

axiosInstance.interceptors.request.use(
  (config) => {
    const auth = getAuthData();

    if (auth?.access) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${auth.access}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);


// ============================================================
// TOKEN REFRESH STATE
// ============================================================

let isRefreshing = false;

let pendingQueue = [];


// ============================================================
// RESOLVE QUEUED REQUESTS
// ============================================================

function resolveQueue(error, token) {
  pendingQueue.forEach(
    ({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    }
  );

  pendingQueue = [];
}


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

axiosInstance.interceptors.response.use(

  // ----------------------------------------------------------
  // SUCCESS
  // ----------------------------------------------------------

  (response) => response,


  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  async (error) => {

    const original = error.config;


    // --------------------------------------------------------
    // Only handle 401 errors
    // --------------------------------------------------------

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }


    // --------------------------------------------------------
    // No original request
    // --------------------------------------------------------

    if (!original) {
      return Promise.reject(error);
    }


    // --------------------------------------------------------
    // Never refresh these endpoints
    // --------------------------------------------------------

    const requestUrl =
      original.url || "";

    if (
      requestUrl.includes("token/") ||
      requestUrl.includes("login")
    ) {
      return Promise.reject(error);
    }


    // --------------------------------------------------------
    // Prevent infinite retry
    // --------------------------------------------------------

    if (original._retry) {
      return Promise.reject(error);
    }


    // --------------------------------------------------------
    // Get authentication data
    // --------------------------------------------------------

    const auth = getAuthData();


    /*
     * IMPORTANT:
     *
     * If there is NO authentication data at all,
     * this is simply an unauthenticated request.
     *
     * Do NOT automatically redirect the user to Login.
     *
     * This allows public pages such as:
     *
     * /
     * /about
     * /gallery
     * /events
     * /contact
     *
     * to make public API requests safely.
     */

    if (!auth?.refresh) {
      return Promise.reject(error);
    }


    // --------------------------------------------------------
    // Another request is already refreshing
    // --------------------------------------------------------

    if (isRefreshing) {

      return new Promise(
        (resolve, reject) => {

          pendingQueue.push({
            resolve,
            reject,
          });

        }
      ).then(
        (newAccess) => {

          original.headers =
            original.headers || {};

          original.headers.Authorization =
            `Bearer ${newAccess}`;

          return axiosInstance(original);

        }
      );

    }


    // --------------------------------------------------------
    // Start token refresh
    // --------------------------------------------------------

    original._retry = true;

    isRefreshing = true;


    try {

      const response = await axios.post(
        `${baseURL}token/refresh/`,
        {
          refresh: auth.refresh,
        }
      );


      const newAccess =
        response.data.access;


      const updatedAuth = {
        ...auth,
        access: newAccess,
      };


      // Save new access token
      setAuthData(updatedAuth);


      // Resolve waiting requests
      resolveQueue(
        null,
        newAccess
      );


      // Retry original request
      original.headers =
        original.headers || {};

      original.headers.Authorization =
        `Bearer ${newAccess}`;


      return axiosInstance(original);

    } catch (refreshError) {

      // Reject waiting requests
      resolveQueue(
        refreshError,
        null
      );


      // Refresh token is invalid/expired
      clearAuthAndRedirect();


      return Promise.reject(
        refreshError
      );

    } finally {

      isRefreshing = false;

    }
  }
);


export default axiosInstance;
