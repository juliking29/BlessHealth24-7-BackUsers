import RegisterUserDriver from '../../domain/ports/RegisterUserDriver'
import AbstractUser from '../../domain/abstract/AbstractUser'

export default class RegisterUser implements RegisterUserDriver {
  constructor(private readonly service: AbstractUser) {}
  async execute(input: Parameters<AbstractUser['register']>[0]) {
    return this.service.register(input as any)
  }
}