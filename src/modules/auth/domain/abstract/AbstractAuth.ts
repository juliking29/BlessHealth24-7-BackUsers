import { AuthCredentials, AuthResult } from '../entities/Auth'

export default abstract class AbstractAuth {
  abstract login(credentials: AuthCredentials): Promise<AuthResult>
  abstract forgotPassword(email: string): Promise<{ ok: boolean }>
  abstract resetPassword(userId: number, newPassword: string): Promise<{ ok: boolean }>
  abstract googleLogin(idToken: string): Promise<{ token: string; provider: 'google' }>  
  abstract biometricLogin(biometricData: string): Promise<{ ok: boolean; provider: 'biometric' }>
}