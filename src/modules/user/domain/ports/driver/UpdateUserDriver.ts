import { User } from '../../entities/User'

export default interface UpdateUserDriver {
  execute(id: number, data: Partial<Pick<User, 'nombreUsuario' | 'emailUsuario' | 'pwdUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'idSede' | 'estadoUsuario'>>): Promise<void>
}