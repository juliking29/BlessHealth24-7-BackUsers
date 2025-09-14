import LoginDriver from '../../domain/ports/LoginDriver'
import { AuthCredentials, AuthResult } from '../../domain/entities/Auth'
import AbstractAuth from '../../domain/abstract/AbstractAuth'

// Driver implementation using the driven service (AuthService)
export default class LoginUser implements LoginDriver {
  constructor(private readonly service: AbstractAuth) {}

  public async execute(credentials: AuthCredentials): Promise<AuthResult> {
    return this.service.login(credentials)
  }
}