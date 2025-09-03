import { apiService } from './api';
import type { User, UserCreate, UserUpdate, Token, LoginCredentials } from '../types/auth';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<Token> {
    const token = await apiService.loginRequest<Token>(
      '/auth/login',
      credentials.username,
      credentials.password
    );
    
    // 保存token
    apiService.setAuthToken(token.access_token);
    
    return token;
  }

  async register(userData: UserCreate): Promise<User> {
    return apiService.post<User>('/auth/register', userData);
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me');
  }

  async updateCurrentUser(userData: UserUpdate): Promise<User> {
    return apiService.put<User>('/auth/me', userData);
  }

  logout(): void {
    apiService.removeAuthToken();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();