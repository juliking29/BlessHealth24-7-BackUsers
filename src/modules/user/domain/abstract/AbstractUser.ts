import { User } from '../entities/User'

export default abstract class AbstractUser {
  abstract register(input: Omit<User, 'idUsuario' | 'fechaRegistro' | 'estadoUsuario' | 'pwdUsuario'> & { password: string }): Promise<{ idUsuario: number }>
  abstract getProfile(userId: number): Promise<Pick<User, 'idUsuario' | 'tipoDocumento' | 'numeroDocumento' | 'nombreUsuario' | 'apellidoUsuario' | 'emailUsuario' | 'pwdUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'fechaNacimiento' | 'genero' | 'idRol' | 'idSede' | 'estadoUsuario' | 'fechaRegistro'>>
  abstract updateUser(id: number, data: Partial<Pick<User, 'nombreUsuario' | 'emailUsuario' | 'pwdUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'idSede' | 'estadoUsuario'>>): Promise<void>
}