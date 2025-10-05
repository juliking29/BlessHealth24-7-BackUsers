import AbstractAuth from '../../domain/abstract/AbstractAuth'
import IAuthRepository from '../../domain/interfaces/IAuthRepository'
import IJwtDriverPort from '../../domain/interfaces/IJwtDriverPort'
import IBlowfishDriverPort from '../../domain/interfaces/IBlowfishDriverPort'
import { AuthCredentials, AuthResult } from '../../domain/entities/Auth'
import InMemoryResetStore from '../../infrastructure/store/InMemoryResetStore'
import Mailer from '../../../shared/utils/Mailer'
import { OAuth2Client } from 'google-auth-library'
import AuthServiceDriven from '../../domain/ports/driven/AuthServiceDriven'

const RESET_CODE_TTL_MINUTES = 10
const GOOGLE_CLIENT_IDS = (process.env['GOOGLE_CLIENT_IDS'] ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

export default class AuthService extends AbstractAuth implements AuthServiceDriven{
  private googleClient: OAuth2Client

  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly jwt: IJwtDriverPort,
    private readonly blowfish: IBlowfishDriverPort
  ) {
    super()
    this.googleClient = new OAuth2Client()
  }

  public async login(credentials: AuthCredentials): Promise<AuthResult> {
    const user = await this.authRepo.findUserByEmail(credentials.email)
    if (!user) throw new Error('Invalid credentials')

    const ok = await this.blowfish.compare(credentials.password, user.pwdUsuario)
    if (!ok) throw new Error('Invalid credentials')

    const token = this.jwt.sign({
      sub: user.idUsuario,
      email: user.emailUsuario,
      roleId: user.idRol
    })
    return { token }
  }

  // 1) Forgot password: genera OTP, lo guarda en memoria y envía correo
  public async forgotPassword(email: string): Promise<{ ok: boolean }> {
    try {
      // Busca usuario para capturar userId (sin revelar existencia)
      let userId: number | undefined = undefined
      try {
        const user = await this.authRepo.findUserByEmail(email)
        if (user?.idUsuario) userId = user.idUsuario
      } catch { /* no revelar nada */ }

      // Genera código de 6 dígitos y guarda con TTL
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const ttlMs = RESET_CODE_TTL_MINUTES * 60 * 1000
      InMemoryResetStore.set(email, code, ttlMs, userId)

      // Log en dev
      if (process.env['NODE_ENV'] !== 'production') {
        console.log(`[DEV][OTP] Email: ${email} | Code: ${code} | Expires: ${RESET_CODE_TTL_MINUTES}m`)
      }

      // Enviar correo
      await Mailer.send({
        to: email,
        subject: 'Código de restablecimiento de contraseña',
        text: `Tu código es ${code}. Expira en ${RESET_CODE_TTL_MINUTES} minutos.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
            <h2>Restablecer contraseña</h2>
            <p>Tu código de verificación es:</p>
            <p style="font-size:24px;font-weight:bold;letter-spacing:2px">${code}</p>
            <p>Este código expira en ${RESET_CODE_TTL_MINUTES} minutos.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          </div>
        `
      })

      return { ok: true }
    } catch (err) {
      if (process.env['NODE_ENV'] !== 'production') {
        console.error('[AuthService.forgotPassword] send error:', err)
      }
      // No revelar problemas al cliente.
      return { ok: true }
    }
  }

  // 2) Reset password: verificación del resetToken + actualización de contraseña
  // Nota: si ya tienes un UC ResetPassword (con userRepo), puedes hacer que este servicio NO se use.
  // Aquí dejo una versión funcional si tu authRepo soporta updatePassword.
  public async resetPassword(userId: number, newPassword: string): Promise<{ ok: boolean }> {
    // Hash
    const hashed = await this.blowfish.hash(newPassword)

    // Actualiza con el repositorio. Ajusta el método según tu interfaz real.
    // Si tu IAuthRepository no tiene este método, usa el UserRepository en el UC ResetPassword.
    if (typeof (this.authRepo as any).updatePassword === 'function') {
      await (this.authRepo as any).updatePassword(userId, hashed)
    } else {
      // Si no existe, lanza o deja un log para recordar que debe delegarse al UC ResetPassword.
      throw new Error('resetPassword not supported by AuthRepository. Use ResetPassword use-case with UserRepository.')
    }

    return { ok: true }
  }

  // 3) Google login: verifica id_token de Google y entrega tu access token
  public async googleLogin(idToken: string): Promise<{ token: string; provider: 'google' }> {
    if (!idToken) throw new Error('Missing Google id_token')

    // Construimos options sin incluir 'audience' cuando no hay IDs
    const options: { idToken: string; audience?: string | string[] } = { idToken }
    if (GOOGLE_CLIENT_IDS.length) {
      options.audience = GOOGLE_CLIENT_IDS as string[]
    }

    const ticket = await this.googleClient.verifyIdToken(options)
    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token')
    }

    const email = payload.email
    const user = await this.authRepo.findUserByEmail(email)
    if (!user) {
      throw new Error('User not registered')
    }

    const token = this.jwt.sign({
      sub: user.idUsuario,
      email: user.emailUsuario,
      roleId: user.idRol
    })

    return { token, provider: 'google' }
  }

  // Mantengo el stub biométrico
  public async biometricLogin(_biometricData: string): Promise<{ ok: boolean; provider: 'biometric' }> {
    return { ok: true, provider: 'biometric' }
  }
}