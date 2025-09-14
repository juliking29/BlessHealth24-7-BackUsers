import AbstractUser from '../../domain/abstract/AbstractUser'

export default class UpdateUser {
  constructor(private readonly service: AbstractUser) {}
  async execute(id: number, data: any) {
    return this.service.updateUser(id, data)
  }
}