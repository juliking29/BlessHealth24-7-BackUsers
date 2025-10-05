import { User } from '../../entities/User'

export default interface GetProfileDriver {
execute(userId: number): Promise<Pick<User, 'idUsuario' | 'tipoDocumento' | 'numeroDocumento' | 'nombreUsuario' | 'apellidoUsuario' | 'emailUsuario' | 'pwdUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'fechaNacimiento' | 'genero' | 'idRol' | 'idSede' | 'estadoUsuario' | 'fechaRegistro'>>
}