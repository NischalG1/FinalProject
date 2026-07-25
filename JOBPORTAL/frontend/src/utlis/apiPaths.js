// frontend/src/utlis/apiPaths.js
export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    LOGOUT: "/api/auth/logout",
    GET_PROFILE: "/api/auth/me",
    UPDATE_PROFILE: "/api/user/profile",
    DELETE_RESUME: "/api/user/resume",
  },

  DASHBOARD: {
    OVERVIEW: `/api/analytics/overview`,
  },

  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,
    GET_JOBS_BY_COMPANY: (id) => `/api/jobs/company/${id}`,
  },

  SAVED_JOBS: {
    SAVE: (id) => `/api/saved-jobs/${id}`,
    UNSAVE: (id) => `/api/saved-jobs/${id}`,
    GET_MY: "/api/saved-jobs/my",
  },

  RECOMMENDATIONS: {
    GET_RECOMMENDATIONS: "/api/recommendations",
    GET_SIMILAR_JOBS: (id) => `/api/recommendations/similar/${id}`,
    GET_COLLABORATIVE: "/api/recommendations/collaborative",
    CLEAR_CACHE: "/api/recommendations/clear-cache",
  },

  USER: {
    GET_PUBLIC_PROFILE: (id) => `/api/user/${id}`,
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_MY_APPLICATIONS: "/api/applications/my",
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
    GET_APPLICANTS_SCORING: (id) => `/api/applications/job/${id}/scoring`,
    GET_TOP_APPLICANTS: (id) => `/api/applications/job/${id}/top`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },

  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    UNREAD_COUNT: "/api/notifications/unread-count",
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
    DELETE: (id) => `/api/notifications/${id}`,
    CLEAR_ALL: "/api/notifications/clear-all",
    SEND: "/api/notifications",
    BROADCAST: "/api/notifications/broadcast",
  },

  ADMIN: {
    GET_ALL_USERS: "/api/admin/users",
    DELETE_USER: (id) => `/api/admin/users/${id}`,
    GET_PENDING_JOBS: "/api/admin/jobs/pending",
    GET_ALL_JOBS: "/api/admin/jobs",
    APPROVE_JOB: (id) => `/api/admin/jobs/${id}/approve`,
    REJECT_JOB: (id) => `/api/admin/jobs/${id}/reject`,
    DELETE_JOB: (id) => `/api/admin/jobs/${id}`,
    GET_RECENT_ACTIVITY: "/api/admin/activity",
  },
};