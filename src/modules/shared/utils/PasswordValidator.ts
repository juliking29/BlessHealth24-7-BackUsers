import bcrypt from 'bcryptjs'
import IBlowfishDriverPort from '../../auth/domain/interfaces/IBlowfishDriverPort'

// Driver que implementa el port de dominio (blowfish/bcrypt)
const BlowfishDriver: IBlowfishDriverPort = {
  async hash(plain: string) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(plain, salt)
  },
  async compare(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed)
  }
}
export default BlowfishDriver