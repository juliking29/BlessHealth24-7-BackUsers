import IUserRepository from '../../../user/domain/interfaces/IUserRepository'
import BlowfishDriver from '../../../shared/utils/PasswordValidator'
import IJwtDriverPort from '../../domain/interfaces/IJwtDriverPort'
import ResetPasswordDriver from '../../domain/ports/driver/ResetPasswordDriver'

export default class ResetPassword implements ResetPasswordDriver {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwt: IJwtDriverPort
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<{ ok: boolean }> {
    console.log('[RESET] incoming token len=', resetToken?.length)
    const payload = this.jwt.verify(resetToken) as any
    console.log('[RESET] payload=', payload)
    if (!payload || payload.purpose !== 'password_reset') {
      throw new Error('Invalid reset token')
    }
    if (payload?.purpose !== 'password_reset') {
      throw new Error('Invalid reset token')
    }

    let userId = payload.sub as number | undefined
    let email = payload.email as string | undefined

    if (!userId && email) {
      const user = await this.userRepo.findByEmail(email)
      if (!user?.idUsuario) throw new Error('User not found')
      userId = user.idUsuario
    }

    if (!userId) throw new Error('Invalid reset token (no user)')

    const hashed = await BlowfishDriver.hash(newPassword)
    await this.userRepo.updateUser(userId, { pwdUsuario: hashed } as any)
    return { ok: true }
  }
}