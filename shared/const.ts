export const COOKIE_NAME = "app_session_id";
export const LOCAL_AUTH_COOKIE_NAME = "app_local_auth";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Session timeout configuration (30 minutes of inactivity)
export const SESSION_TIMEOUT_MS = 1000 * 60 * 30; // 30 minutes
export const SESSION_TIMEOUT_WARNING_MS = 1000 * 60 * 25; // Warn at 25 minutes
