// frontend/src/utlis/apiPaths.js
export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Signup
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/me", // Get logged-in user details
    UPDATE_PROFILE: "/api/user/profile", // Update profile details
    DELETE_RESUME: "/api/user/resume", // Delete Resume details
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
    
    // Recommendation endpoints
    GET_RECOMMENDATIONS: "/api/jobs/recommendations",
    GET_COLLABORATIVE: "/api/jobs/collaborative/recommendations",
    GET_SIMILAR_JOBS: (id) => `/api/jobs/${id}/similar`,
    CLEAR_CACHE: "/api/jobs/recommendations/clear-cache",

    // Saved jobs
    SAVE_JOB: (id) => `/api/saved-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/saved-jobs/${id}`,
    GET_SAVED_JOBS: "/api/saved-jobs/my",
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_MY_APPLICATIONS: "/api/applications/my",
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
    // Scoring endpoints
    GET_APPLICANTS_SCORING: (id) => `/api/applications/job/${id}/scoring`,
    GET_TOP_APPLICANTS: (id) => `/api/applications/job/${id}/top`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Upload profile picture
  },

  ADMIN: {
    GET_ALL_USERS: "/api/admin/users",
    DELETE_USER: (id) => `/api/admin/users/${id}`,
    GET_PENDING_JOBS: "/api/admin/jobs/pending",
    GET_ALL_JOBS: "/api/admin/jobs",
    APPROVE_JOB: (id) => `/api/admin/jobs/${id}/approve`,
    REJECT_JOB: (id) => `/api/admin/jobs/${id}/reject`,
    DELETE_JOB: (id) => `/api/admin/jobs/${id}`,
  },
};