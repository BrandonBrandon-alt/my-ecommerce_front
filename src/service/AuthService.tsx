import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface RegisterUserDTO {
  idNumber: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  dateOfBirth?: string; // ISO date string (yyyy-MM-dd)
  termsAccepted: boolean;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface GoogleOAuthLoginDTO {
  idToken: string;
}

interface ActivateAccountDTO {
  activationCode: string;
}

interface ResendActivationCodeDTO {
  email: string;
}

interface RequestImmediateUnlockDTO {
  email: string;
}

interface VerifyUnlockCodeDTO {
  code: string;
}

interface ForgotPasswordDTO {
  email: string;
}

interface ResetPasswordDTO {
  resetCode: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface RequestEmailChangeDTO {
  newEmail: string;
  newEmailConfirmation: string;
  currentPassword: string;
}

interface VerifyEmailChangeDTO {
  verificationCode: string;
}

interface UpdateUserProfileDTO {
  name?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface RefreshTokenDTO {
  refreshToken: string;
}

interface AuthResponseDTO {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user_info?: UserInfoDTO;
  timestamp?: string;
  message?: string;
}

interface UserInfoDTO {
  id: number;
  email: string;
  name: string;
  lastName: string;
  fullName?: string;
  initials?: string;
  role: string;
  status: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  age?: number;
  dateOfBirth?: string;
  isMinor?: boolean;
  lastLogin?: string;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  enabled?: boolean;
  createdAt?: string;
}

interface TokenValidationDTO {
  valid: boolean;
  username?: string;
  expires_in?: number;
  timestamp?: string;
  message?: string;
}

// ============================================================================
// SERVICIO DE AUTENTICACIÓN PARA NEXT.JS
// ============================================================================

class AuthService {
  private api: AxiosInstance;
  private readonly BASE_URL = '/auth';
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos de timeout
    });

    // Solo ejecutar interceptores en el cliente
    if (typeof window !== 'undefined') {
      this.setupInterceptors();
    }
  }

  private processQueue(error: AxiosError | null, token: string | null = null): void {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Si el token expiró, intentar refrescar
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si ya se está refrescando, encolar la petición
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.api(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken({ refreshToken });
              if (response.access_token) {
                this.setToken(response.access_token);
                this.processQueue(null, response.access_token);
                
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
                }
                return this.api(originalRequest);
              }
            }
            throw new Error('No refresh token available');
          } catch (refreshError) {
            this.processQueue(refreshError as AxiosError, null);
            this.clearAuth();
            
            // Redirigir al login en Next.js
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // REGISTRO Y ACTIVACIÓN
  // ============================================================================

  async register(data: RegisterUserDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/register`, data);
    return response.data;
  }

  async activateAccount(data: ActivateAccountDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/activate-account`, data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.setRefreshToken(response.data.refresh_token);
      }
    }
    return response.data;
  }

  async resendActivationCode(data: ResendActivationCodeDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/resend-activation-code`, data);
    return response.data;
  }

  // ============================================================================
  // LOGIN Y LOGOUT
  // ============================================================================

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/login`, data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.setRefreshToken(response.data.refresh_token);
      }
    }
    return response.data;
  }

  async loginWithGoogle(data: GoogleOAuthLoginDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/login/google`, data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.setRefreshToken(response.data.refresh_token);
      }
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await this.api.post(`${this.BASE_URL}/logout`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearAuth();
      // Redirigir en Next.js
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // ============================================================================
  // DESBLOQUEO DE CUENTA
  // ============================================================================

  async requestUnlock(data: RequestImmediateUnlockDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/request-unlock`, data);
    return response.data;
  }

  async verifyUnlockCode(data: VerifyUnlockCodeDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/verify-unlock-code`, data);
    return response.data;
  }

  // ============================================================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================================================

  async forgotPassword(data: ForgotPasswordDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/forgot-password`, data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/reset-password`, data);
    return response.data;
  }

  // ============================================================================
  // GESTIÓN DE CONTRASEÑA Y EMAIL
  // ============================================================================

  async changePassword(data: ChangePasswordDTO): Promise<AuthResponseDTO> {
    const response = await this.api.put<AuthResponseDTO>(`${this.BASE_URL}/change-password`, data);
    return response.data;
  }

  async requestEmailChange(data: RequestEmailChangeDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/request-email-change`, data);
    return response.data;
  }

  async verifyEmailChange(data: VerifyEmailChangeDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/verify-email-change`, data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  // ============================================================================
  // GESTIÓN DE PERFIL
  // ============================================================================

  async updateProfile(data: UpdateUserProfileDTO): Promise<AuthResponseDTO> {
    const response = await this.api.put<AuthResponseDTO>(`${this.BASE_URL}/update-profile`, data);
    return response.data;
  }

  async getCurrentUser(): Promise<UserInfoDTO> {
    const response = await this.api.get<UserInfoDTO>(`${this.BASE_URL}/me`);
    return response.data;
  }

  // ============================================================================
  // VALIDACIÓN Y REFRESH DE TOKENS
  // ============================================================================

  async validateToken(): Promise<TokenValidationDTO> {
    const token = this.getToken();
    if (!token) {
      return { valid: false, message: 'No token found' };
    }

    try {
      const response = await this.api.post<TokenValidationDTO>(
        `${this.BASE_URL}/validate-token`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return { valid: false, message: 'Token validation failed' };
    }
  }

  async refreshToken(data: RefreshTokenDTO): Promise<AuthResponseDTO> {
    const response = await this.api.post<AuthResponseDTO>(`${this.BASE_URL}/refresh-token`, data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.setRefreshToken(response.data.refresh_token);
      }
    }
    return response.data;
  }

  // ============================================================================
  // GESTIÓN DE TOKENS CON COOKIES (RECOMENDADO PARA NEXT.JS)
  // ============================================================================

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      // En desarrollo, usar cookies sin Secure
      const isProduction = process.env.NODE_ENV === 'production';
      const secureFlag = isProduction ? '; Secure' : '';
      document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict${secureFlag}`;
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const name = 'token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  private setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      // Refresh token con mayor duración (7 días)
      const isProduction = process.env.NODE_ENV === 'production';
      const secureFlag = isProduction ? '; Secure' : '';
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict${secureFlag}`;
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const name = 'refreshToken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  

  getAuthToken(): string | null {
    return this.getToken();
  }

  getUserInfo(): UserInfoDTO | null {
    // Método auxiliar para obtener info del usuario en caché
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decodificar JWT (solo la parte del payload)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}



// Crear instancia única
let authServiceInstance: AuthService | null = null;

function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

// Exportar la función que devuelve la instancia
export default getAuthService();

// Exportar también las interfaces para uso en otros archivos
export type {
  RegisterUserDTO,
  LoginDTO,
  ActivateAccountDTO,
  ResendActivationCodeDTO,
  RequestImmediateUnlockDTO,
  VerifyUnlockCodeDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
  RequestEmailChangeDTO,
  VerifyEmailChangeDTO,
  UpdateUserProfileDTO,
  RefreshTokenDTO,
  AuthResponseDTO,
  UserInfoDTO,
  TokenValidationDTO,
};