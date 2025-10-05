import GetProfileDriver from '../../domain/ports/driver/GetProfileDriver'
import AbstractUser from '../../domain/abstract/AbstractUser'

export default class GetUserProfile implements GetProfileDriver {
  constructor(private readonly service: AbstractUser) {}
  async execute(userId: number) {
    return this.service.getProfile(userId)
  }
}