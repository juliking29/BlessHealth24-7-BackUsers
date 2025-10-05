import { User } from "../../entities/User";

export interface UserServiceDriven {
    register(input: {tipoDocumento: number; numeroDocumento: string; nombreUsuario: string; apellidoUsuario: string;
    emailUsuario: string; password: string; telefonoUsuario: string; direccionUsuario: string;
    idRol: number; idSede?: number | null; fechaNacimiento?: string | null; genero?: 'M'|'F'|null}): Promise<{ idUsuario: number }>
    
    getProfile(userId: number): Promise<Pick<User,'idUsuario' | 'tipoDocumento' | 'numeroDocumento' | 'nombreUsuario' | 'apellidoUsuario' | 'emailUsuario' | 'pwdUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'fechaNacimiento' | 'genero' | 'idRol' | 'idSede' | 'estadoUsuario' | 'fechaRegistro'>>
    
    updateUser(id: number, data: Partial<Pick<User, 'nombreUsuario' | 'emailUsuario' | 'pwdUsuario' | 'telefonoUsuario' | 'direccionUsuario' | 'idSede' | 'estadoUsuario'>>): Promise<void>
}