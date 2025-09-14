export interface User {
  id?: string; // optional if not returned
  email: string;
  username: string;
  company_id?: number | null;
  company_name?: string | null;
  group: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}


export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}