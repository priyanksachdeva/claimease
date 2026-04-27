const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  // Bills endpoints
  BILLS: `${API_BASE}/api/bills`,
  BILLS_INSURANCE: `${API_BASE}/api/bills/insurance/bills`,

  // Claims endpoints
  CLAIMS: `${API_BASE}/api/claims`,
  CLAIMS_INSURANCE: `${API_BASE}/api/claims/insurance/claims`,
  CLAIMS_APPROVE: (id: string) => `${API_BASE}/api/claims/${id}/approve`,
  CLAIMS_REJECT: (id: string) => `${API_BASE}/api/claims/${id}/reject`,

  // Auth endpoints
  AUTH: `${API_BASE}/api/auth`,
  LOGIN: `${API_BASE}/api/auth/login`,
  REGISTER: `${API_BASE}/api/auth/register`,

  // Organizations endpoints
  ORGANIZATIONS: `${API_BASE}/api/organizations`,
  ORGANIZATIONS_REGISTER_HOSPITAL: `${API_BASE}/api/organizations/register/hospital`,
  ORGANIZATIONS_REGISTER_INSURANCE: `${API_BASE}/api/organizations/register/insurance`,

  // Messaging endpoints
  MESSAGES: `${API_BASE}/api/messages`,
  MESSAGES_CONVERSATIONS: `${API_BASE}/api/messages/conversations`,
  MESSAGES_START: `${API_BASE}/api/messages/start`,
};
