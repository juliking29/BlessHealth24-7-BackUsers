import AbstractUser from '../../domain/abstract/AbstractUser'
import UpdateUserDriver from '../../domain/ports/driver/UpdateUserDriver'

export default class UpdateUser implements UpdateUserDriver {
  constructor(private readonly service: AbstractUser) {}
  async execute(id: number, data: any) {
    return this.service.updateUser(id, data)
  }
}