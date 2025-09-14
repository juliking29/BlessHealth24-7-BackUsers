import InMemoryResetStore from '../../infrastructure/store/InMemoryResetStore'
import IJwtDriverPort from '../../domain/interfaces/IJwtDriverPort'

export default class VerifyResetCode {
  constructor(private readonly jwt: IJwtDriverPort) {}

  async execute(email: string, code: string): Promise<{ ok: true; resetToken: string }> {
    const entry = InMemoryResetStore.get(email)
    if (!entry || entry.used || entry.code !== code) {
      throw new Error('Invalid or expired code')
    }
    // Marca como usado para evitar reuso
    InMemoryResetStore.markUsed(email)

    // Emite resetToken por 10 min. Si tu driver usa JWT_ACCESS_TTL, asegúrate de que sea 10m.
    // Incluimos purpose para distinguirlo en reset.
    // src/modules/auth/application/use-cases/VerifyResetCode.ts
    const payload: any = { sub: entry.userId ?? 0, email, roleId: 0, purpose: 'password_reset' }
    const resetToken = this.jwt.sign(payload)
    console.log('[VERIFY] issued resetToken len=', resetToken.length)
    return { ok: true, resetToken }
  }
}