import AbstractUser from '../abstract/AbstractUser'
import { User } from '../entities/User'

export default class NullUser extends AbstractUser {
  async register(_input: any): Promise<{ idUsuario: number }> {
    return { idUsuario: 0 }
  }
  async getProfile(_userId: number): Promise<Pick<User, 'idUsuario' | 'tipoDocumento' | 'numeroDocumento' | 'nombreUsuario' | 'apellidoUsuario' | 'emailUsuario' | 'pwdUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'fechaNacimiento' | 'genero' | 'idRol' | 'idSede' | 'estadoUsuario' | 'fechaRegistro'>> {
    return { idUsuario: 0, tipoDocumento: 0, numeroDocumento: '', nombreUsuario: '', apellidoUsuario: '', emailUsuario: '', pwdUsuario: '', telefonoUsuario: '', direccionUsuario: '', fechaNacimiento: '', genero: null, idRol: 0, idSede: null, estadoUsuario: 0, fechaRegistro: new Date() }
  }
  async updateUser(_id: number, _data: any): Promise<void> {
    return
  }
}