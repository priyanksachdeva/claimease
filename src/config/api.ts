/**
 * API Configuration
 * Centralizes API base URL management for all frontend applications
 */

const API_BASE = import.meta.env?.REACT_APP_API_URL || 
                 import.meta.env?.VITE_API_URL || 
                 "http://localhost:3001";

export const API_ENDPOINTS = {
  BILLS: `${API_BASE}/api/bills`,
  BILLS_UPLOAD: `${API_BASE}/api/bills/upload`,
  BILLS_MY: `${API_BASE}/api/bills/user/my-bills`,
  BILLS_HOSPITAL: `${API_BASE}/api/bills/hospital/bills`,
  
  CLAIMS: `${API_BASE}/api/claims`,
  CLAIMS_MY: `${API_BASE}/api/claims/user/my-claims`,
  CLAIMS_HOSPITAL: `${API_BASE}/api/claims/hospital/claims`,
  CLAIMS_INSURANCE: `${API_BASE}/api/claims/insurance/claims`,
  CLAIMS_INSURANCE_PENDING: `${API_BASE}/api/claims/insurance/pending`,
  
  AUTH: `${API_BASE}/api/auth`,
  AUTH_LOGIN: `${API_BASE}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE}/api/auth/register`,
  AUTH_ME: `${API_BASE}/api/auth/me`,
  
  ORGANIZATIONS: `${API_BASE}/api/organizations`,
  ORGANIZATIONS_HOSPITALS: `${API_BASE}/api/organizations/hospitals`,
  ORGANIZATIONS_INSURANCE: `${API_BASE}/api/organizations/insurance`,

  MESSAGES: `${API_BASE}/api/messages`,
  MESSAGES_CONVERSATIONS: `${API_BASE}/api/messages/conversations`,

  NOTIFICATIONS: `${API_BASE}/api/notifications`,
  NOTIFICATIONS_UNREAD_COUNT: `${API_BASE}/api/notifications/unread/count`,
  NOTIFICATIONS_READ_ALL: `${API_BASE}/api/notifications/read/all`,

  SETTINGS: `${API_BASE}/api/settings`,
  PAYMENT_METHODS: `${API_BASE}/api/settings/payment-methods`,
};

export default API_ENDPOINTS;
