import IJwtDriverPort from '../../domain/interfaces/IJwtDriverPort'
import IAuthRepository from '../../domain/interfaces/IAuthRepository'
import { OAuth2Client, LoginTicket } from 'google-auth-library'
import GoogleLoginDriver from '../../domain/ports/driver/GoogleLoginDriver'

const GOOGLE_CLIENT_IDS = (process.env['GOOGLE_CLIENT_IDS'] ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

export default class GoogleLogin implements GoogleLoginDriver {
  private googleClient: OAuth2Client

  constructor(
    private readonly jwt: IJwtDriverPort,
    private readonly authRepo: IAuthRepository
  ) {
    this.googleClient = new OAuth2Client()
  }

  public async execute(idToken: string): Promise<{ token: string; provider: 'google' }> {
    if (!idToken) throw new Error('Missing Google id_token')

    const options: { idToken: string; audience?: string | string[] } = { idToken }
    if (GOOGLE_CLIENT_IDS.length) {
      options.audience = GOOGLE_CLIENT_IDS
    }

    const ticket: LoginTicket = await this.googleClient.verifyIdToken(options)
    const payload = ticket.getPayload()
    if (!payload?.email) {
      throw new Error('Invalid Google token payload')
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
}