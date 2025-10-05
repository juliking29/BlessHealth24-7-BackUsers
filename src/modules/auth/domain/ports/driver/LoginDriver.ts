import { AuthCredentials, AuthResult } from '../../entities/Auth'

// Driver (caso de uso orientado a interfaz de aplicación)
export default interface LoginDriver {
  execute(credentials: AuthCredentials): Promise<AuthResult>
}