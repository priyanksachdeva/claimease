import axios, { AxiosInstance } from "axios";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "patient" | "hospital" | "insurance";
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgId?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL = "http://localhost:3001/api") {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Load token from localStorage if available
    const savedToken = localStorage.getItem("claimease_token");
    if (savedToken) {
      this.setToken(savedToken);
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("claimease_token", token);
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("claimease_token");
    delete this.client.defaults.headers.common["Authorization"];
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(
      "/auth/register",
      data,
    );
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async registerHospital(data: any): Promise<any> {
    const response = await this.client.post(
      "/organizations/register/hospital",
      data,
    );
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>("/auth/login", data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>("/auth/me");
    return response.data;
  }

  // Bills endpoints
  async createBill(data: any) {
    const response = await this.client.post("/bills", data);
    return response.data;
  }

  async getBill(id: string) {
    const response = await this.client.get(`/bills/${id}`);
    return response.data;
  }

  async getUserBills() {
    const response = await this.client.get("/bills/user/my-bills");
    return response.data;
  }

  async getHospitalBills() {
    const response = await this.client.get("/bills/hospital/bills");
    return response.data;
  }

  async updateBillStatus(id: string, status: string) {
    const response = await this.client.patch(`/bills/${id}/status`, { status });
    return response.data;
  }

  // Claims endpoints
  async createClaim(data: any) {
    const response = await this.client.post("/claims", data);
    return response.data;
  }

  async getClaim(id: string) {
    const response = await this.client.get(`/claims/${id}`);
    return response.data;
  }

  async getUserClaims() {
    const response = await this.client.get("/claims/user/my-claims");
    return response.data;
  }

  async getInsuranceClaims(status?: string) {
    const params = status ? { status } : {};
    const response = await this.client.get("/claims/insurance/pending", {
      params,
    });
    return response.data;
  }

  async approveClaim(id: string) {
    const response = await this.client.patch(`/claims/${id}/approve`);
    return response.data;
  }

  async rejectClaim(id: string, rejectionReason: string) {
    const response = await this.client.patch(`/claims/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  }

  async getClaimEvents(claimId: string) {
    const response = await this.client.get(`/claims/${claimId}/events`);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Also export the class for testing
export default APIClient;
