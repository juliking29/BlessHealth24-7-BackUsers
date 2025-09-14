import Mailer from '../../../shared/utils/Mailer'
import InMemoryResetStore from '../../infrastructure/store/InMemoryResetStore'
import IUserRepository from '../../../user/domain/interfaces/IUserRepository'

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6 dígitos
}

export default class ForgotPassword {
  constructor(private readonly users: IUserRepository) {}

  async execute(email: string): Promise<{ ok: boolean }> {
    try {
      // Busca user opcionalmente (sin revelar existencia)
      let userId: number | undefined = undefined
      try {
        const user = await this.users.findByEmail(email)
        if (user?.idUsuario) userId = user.idUsuario
      } catch {
        // Ignorar para no revelar existencia
      }

      const code = genCode()
      const ttlMs = 10 * 60 * 1000 // 10 minutos
      InMemoryResetStore.set(email, code, ttlMs, userId)

      // En desarrollo, loguea el OTP para depurar
      if (process.env['NODE_ENV'] !== 'production') {
        console.log(`[DEV][OTP] Email: ${email} | Code: ${code} | Expires in: 10m`)
      }

      // Enviar correo real via SendGrid (Mailer.ts debe estar integrado con @sendgrid/mail)
      await Mailer.send({
        to: email, // ejemplo: "iqscoreking@gmail.com"
        subject: 'Código de restablecimiento de contraseña',
        text: `Tu código es ${code}. Expira en 10 minutos.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
            <h2>Restablecer contraseña</h2>
            <p>Tu código de verificación es:</p>
            <p style="font-size:24px;font-weight:bold;letter-spacing:2px">${code}</p>
            <p>Este código expira en 10 minutos.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          </div>
        `
      })

      return { ok: true }
    } catch (err) {
      // No revelar fallas ni existencia del correo. Log interno para diagnóstico.
      if (process.env['NODE_ENV'] !== 'production') {
        console.error('[ForgotPassword] Error sending email:', err)
      }
      return { ok: true }
    }
  }
}