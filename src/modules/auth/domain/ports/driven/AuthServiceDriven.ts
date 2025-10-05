import { AuthCredentials, AuthResult } from '../../entities/Auth'

export default interface AuthServiceDriven {
    login(credentials: AuthCredentials): Promise<AuthResult>
    googleLogin(idToken: string): Promise<{ token: string; provider: 'google' }>
    biometricLogin(_biometricData: string): Promise<{ ok: boolean; provider: 'biometric' }>
    forgotPassword(email: string): Promise<{ ok: boolean }>
    resetPassword(userId: number, newPassword: string): Promise<{ ok: boolean }>
}