import AbstractUser from '../../domain/abstract/AbstractUser'
import IUserRepository from '../../domain/interfaces/IUserRepository'
import { User } from '../../domain/entities/User'
import IBlowfishDriverPort from '../../../auth/domain/interfaces/IBlowfishDriverPort'

export default class UserService extends AbstractUser {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly blowfish: IBlowfishDriverPort
  ) { super() }

  async register(input: {
    tipoDocumento: number; numeroDocumento: string; nombreUsuario: string; apellidoUsuario: string;
    emailUsuario: string; password: string; telefonoUsuario: string; direccionUsuario: string;
    idRol: number; idSede?: number | null; fechaNacimiento?: string | null; genero?: 'M'|'F'|null
  }): Promise<{ idUsuario: number }> {
    const hashed = await this.blowfish.hash(input.password)
    const id = await this.userRepo.createUser({
      tipoDocumento: input.tipoDocumento,
      numeroDocumento: input.numeroDocumento,
      nombreUsuario: input.nombreUsuario,
      apellidoUsuario: input.apellidoUsuario,
      emailUsuario: input.emailUsuario,
      pwdUsuario: hashed,
      telefonoUsuario: input.telefonoUsuario,
      direccionUsuario: input.direccionUsuario,
      fechaNacimiento: input.fechaNacimiento ?? null,
      genero: input.genero ?? null,
      idRol: input.idRol,
      idSede: input.idSede ?? null,
      estadoUsuario: 1,
      fechaRegistro: new Date()
    } as any)
    return { idUsuario: id }
  }

  async getProfile(userId: number): Promise<Pick<User,'idUsuario'|'nombreUsuario'|'apellidoUsuario'|'emailUsuario'|'idRol'>> {
    const u = await this.userRepo.findById(userId)
    if (!u) throw new Error('User not found')
    return {
      idUsuario: u.idUsuario,
      nombreUsuario: u.nombreUsuario,
      apellidoUsuario: u.apellidoUsuario,
      emailUsuario: u.emailUsuario,
      idRol: u.idRol
    }
  }

  async updateUser(id: number, data: Partial<Pick<User, 'nombreUsuario'|'apellidoUsuario'|'telefonoUsuario'|'direccionUsuario'|'idSede'>>): Promise<void> {
    await this.userRepo.updateUser(id, data as any)
  }
}