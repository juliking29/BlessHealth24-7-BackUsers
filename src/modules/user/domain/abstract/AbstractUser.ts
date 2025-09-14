import { User } from '../entities/User'

export default abstract class AbstractUser {
  abstract register(input: Omit<User, 'idUsuario' | 'fechaRegistro' | 'estadoUsuario' | 'pwdUsuario'> & { password: string }): Promise<{ idUsuario: number }>
  abstract getProfile(userId: number): Promise<Pick<User, 'idUsuario' | 'nombreUsuario' | 'apellidoUsuario' | 'emailUsuario' | 'idRol'>>
  abstract updateUser(id: number, data: Partial<Pick<User, 'nombreUsuario' | 'apellidoUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'idSede'>>): Promise<void>
}