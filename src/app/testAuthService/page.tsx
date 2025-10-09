'use client'

import { useState } from 'react';
import authService, { 
  RegisterUserDTO, 
  LoginDTO,
  ActivateAccountDTO,
  ResendActivationCodeDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
  RequestEmailChangeDTO,
  VerifyEmailChangeDTO,
  UpdateUserProfileDTO,
  RequestImmediateUnlockDTO,
  VerifyUnlockCodeDTO
} from '@/service/AuthService';

export default function TestAuthService() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [...prev, {
      test,
      success,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // ============================================================================
  // TEST: REGISTRO
  // ============================================================================
  const testRegister = async () => {
    setLoading(true);
    try {
      const registerData: RegisterUserDTO = {
        idNumber: '1234567890',
        name: 'Test',
        lastName: 'User',
        email: 'brandonmontealegre@gmail.com',
        phoneNumber: '3001234567',
        password: 'Test123!@#',
        dateOfBirth: '1990-01-01',
        termsAccepted: true
      };

      const response = await authService.register(registerData);
      addResult('Register', true, response);
    } catch (error: any) {
      addResult('Register', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: LOGIN
  // ============================================================================
  const testLogin = async () => {
    setLoading(true);
    try {
      const loginData: LoginDTO = {
        email: 'brandonmontealegre15@gmail.com',
        password: 'M@mahermosa123'
      };

      const response = await authService.login(loginData);
      addResult('Login', true, response);
    } catch (error: any) {
      addResult('Login', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: ACTIVAR CUENTA
  // ============================================================================
  const testActivateAccount = async () => {
    setLoading(true);
    try {
      const code = prompt('Ingresa el código de activación:');
      if (!code) return;

      const activateData: ActivateAccountDTO = {
        activationCode: code
      };

      const response = await authService.activateAccount(activateData);
      addResult('Activate Account', true, response);
    } catch (error: any) {
      addResult('Activate Account', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: REENVIAR CÓDIGO
  // ============================================================================
  const testResendCode = async () => {
    setLoading(true);
    try {
      const response = await authService.resendActivationCode({
        email: 'brandonmontealegre15@gmail.com'
      });
      addResult('Resend Activation Code', true, response);
    } catch (error: any) {
      addResult('Resend Activation Code', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: OBTENER USUARIO ACTUAL
  // ============================================================================
  const testGetCurrentUser = async () => {
    setLoading(true);
    try {
      const response = await authService.getCurrentUser();
      addResult('Get Current User', true, response);
    } catch (error: any) {
      addResult('Get Current User', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: VALIDAR TOKEN
  // ============================================================================
  const testValidateToken = async () => {
    setLoading(true);
    try {
      const response = await authService.validateToken();
      addResult('Validate Token', true, response);
    } catch (error: any) {
      addResult('Validate Token', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: FORGOT PASSWORD
  // ============================================================================
  const testForgotPassword = async () => {
    setLoading(true);
    try {
      const forgotData: ForgotPasswordDTO = {
        email: 'brandonmontealegre15@gmail.com'
      };

      const response = await authService.forgotPassword(forgotData);
      addResult('Forgot Password', true, response);
    } catch (error: any) {
      addResult('Forgot Password', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: RESET PASSWORD
  // ============================================================================
  const testResetPassword = async () => {
    setLoading(true);
    try {
      const code = prompt('Ingresa el código de reseteo:');
      if (!code) return;

      const resetData: ResetPasswordDTO = {
        resetCode: code,
        password: 'NewPassword123!@#',
        confirmPassword: 'NewPassword123!@#'
      };

      const response = await authService.resetPassword(resetData);
      addResult('Reset Password', true, response);
    } catch (error: any) {
      addResult('Reset Password', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: CHECK AUTHENTICATION
  // ============================================================================
  const testCheckAuth = () => {
    const isAuth = authService.isAuthenticated();
    const token = authService.getAuthToken();
    const userInfo = authService.getUserInfo();
    
    addResult('Check Authentication', true, {
      isAuthenticated: isAuth,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      userInfo
    });
  };

  // ============================================================================
  // TEST: LOGOUT
  // ============================================================================
  const testLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      addResult('Logout', true, 'Logged out successfully');
    } catch (error: any) {
      addResult('Logout', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: CHANGE PASSWORD
  // ============================================================================
  const testChangePassword = async () => {
    setLoading(true);
    try {
      const changePasswordData: ChangePasswordDTO = {
        currentPassword: 'NewPassword123!@#',
        newPassword: 'NewPassword456!@#',
        confirmPassword: 'NewPassword456!@#'
      };

      const response = await authService.changePassword(changePasswordData);
      addResult('Change Password', true, response);
    } catch (error: any) {
      addResult('Change Password', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: REQUEST EMAIL CHANGE
  // ============================================================================
  const testRequestEmailChange = async () => {
    setLoading(true);
    try {
      const requestData: RequestEmailChangeDTO = {
        newEmail: 'newemail@example.com',
        newEmailConfirmation: 'newemail@example.com',
        currentPassword: 'NewPassword123!@#'
      };

      const response = await authService.requestEmailChange(requestData);
      addResult('Request Email Change', true, response);
    } catch (error: any) {
      addResult('Request Email Change', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: VERIFY EMAIL CHANGE
  // ============================================================================
  const testVerifyEmailChange = async () => {
    setLoading(true);
    try {
      const code = prompt('Ingresa el código de verificación de email:');
      if (!code) return;

      const verifyData: VerifyEmailChangeDTO = {
        verificationCode: code
      };

      const response = await authService.verifyEmailChange(verifyData);
      addResult('Verify Email Change', true, response);
    } catch (error: any) {
      addResult('Verify Email Change', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: UPDATE PROFILE
  // ============================================================================
  const testUpdateProfile = async () => {
    setLoading(true);
    try {
      const updateData: UpdateUserProfileDTO = {
        name: 'Updated Name',
        lastName: 'Updated LastName',
        phoneNumber: '3009876543'
      };

      const response = await authService.updateProfile(updateData);
      addResult('Update Profile', true, response);
    } catch (error: any) {
      addResult('Update Profile', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: REQUEST UNLOCK
  // ============================================================================
  const testRequestUnlock = async () => {
    setLoading(true);
    try {
      const unlockData: RequestImmediateUnlockDTO = {
        email: 'brandonmontealegre15@gmail.com'
      };

      const response = await authService.requestUnlock(unlockData);
      addResult('Request Unlock', true, response);
    } catch (error: any) {
      addResult('Request Unlock', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TEST: VERIFY UNLOCK CODE
  // ============================================================================
  const testVerifyUnlockCode = async () => {
    setLoading(true);
    try {
      const code = prompt('Ingresa el código de desbloqueo:');
      if (!code) return;

      const verifyData: VerifyUnlockCodeDTO = {
        code: code
      };

      const response = await authService.verifyUnlockCode(verifyData);
      addResult('Verify Unlock Code', true, response);
    } catch (error: any) {
      addResult('Verify Unlock Code', false, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Auth Service Tests
        </h1>

        {/* Estado del Backend */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Backend Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Authenticated:</strong> {authService.isAuthenticated() ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Botones de prueba */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Registro y Activación */}
            <button
              onClick={testRegister}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              Register
            </button>

            <button
              onClick={testActivateAccount}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              Activate Account
            </button>

            <button
              onClick={testResendCode}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 transition"
            >
              Resend Code
            </button>

            {/* Login/Logout */}
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              Login
            </button>

            <button
              onClick={testLogout}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition"
            >
              Logout
            </button>

            {/* Validaciones */}
            <button
              onClick={testValidateToken}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 transition"
            >
              Validate Token
            </button>

            <button
              onClick={testGetCurrentUser}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-400 transition"
            >
              Get Current User
            </button>

            <button
              onClick={testCheckAuth}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-400 transition"
            >
              Check Auth Status
            </button>

            {/* Recuperación */}
            <button
              onClick={testForgotPassword}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400 transition"
            >
              Forgot Password
            </button>

            <button
              onClick={testResetPassword}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:bg-gray-400 transition"
            >
              Reset Password
            </button>

            {/* Gestión de Perfil */}
            <button
              onClick={testChangePassword}
              disabled={loading}
              className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:bg-gray-400 transition"
            >
              Change Password
            </button>

            <button
              onClick={testUpdateProfile}
              disabled={loading}
              className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700 disabled:bg-gray-400 transition"
            >
              Update Profile
            </button>

            {/* Cambio de Email */}
            <button
              onClick={testRequestEmailChange}
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:bg-gray-400 transition"
            >
              Request Email Change
            </button>

            <button
              onClick={testVerifyEmailChange}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400 transition"
            >
              Verify Email Change
            </button>

            {/* Desbloqueo */}
            <button
              onClick={testRequestUnlock}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-gray-400 transition"
            >
              Request Unlock
            </button>

            <button
              onClick={testVerifyUnlockCode}
              disabled={loading}
              className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:bg-gray-400 transition"
            >
              Verify Unlock Code
            </button>
          </div>

          <button
            onClick={clearResults}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Clear Results
          </button>
        </div>

        {/* Resultados */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Running test...</p>
            </div>
          )}

          <div className="space-y-4">
            {results.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-8">
                No tests run yet. Click a button above to start testing.
              </p>
            )}

            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">
                    {result.success ? '✅' : '❌'} {result.test}
                  </h3>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}