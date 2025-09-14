import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import IJwtDriverPort, { JwtPayload } from '../../auth/domain/interfaces/IJwtDriverPort'

const JWT_SECRET: Secret = (process.env['JWT_ACCESS_SECRET'] ?? 'change_me') as Secret
const rawExpires = process.env['JWT_ACCESS_TTL'] ?? '15m'
const expires: string | number = /^[0-9]+$/.test(rawExpires) ? Number(rawExpires) : rawExpires
const signOptions = { expiresIn: expires } as unknown as SignOptions

const JWTProviderDriver: IJwtDriverPort = {
  sign(payload: JwtPayload): string {
    return jwt.sign({ ...payload }, JWT_SECRET, signOptions)
  },
  verify(token: string): any {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (typeof decoded !== 'object' || decoded === null) {
      throw new Error('Invalid token payload')
    }
    // Devuelve todo el payload, incluidos campos extra como 'purpose'
    return decoded
  }
}

export default JWTProviderDriver