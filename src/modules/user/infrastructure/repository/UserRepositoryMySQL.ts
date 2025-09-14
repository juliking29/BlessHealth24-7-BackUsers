import BaseMySQLRepository from '../../../relational-database/infrastructure/repository-base/BaseMySQLRepository'
import IUserRepository from '../../domain/interfaces/IUserRepository'
import { User } from '../../domain/entities/User'

export default class UserRepositoryMySQL extends BaseMySQLRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.query('SELECT * FROM USUARIOS WHERE emailUsuario = ? LIMIT 1', [email])
    const list = rows as any[]
    return list.length ? (list[0] as User) : null
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await this.pool.query('SELECT * FROM USUARIOS WHERE idUsuario = ? LIMIT 1', [id])
    const list = rows as any[]
    return list.length ? (list[0] as User) : null
  }

  async createUser(data: Omit<User, 'idUsuario' | 'fechaRegistro'>): Promise<number> {
    const sql = `INSERT INTO USUARIOS
      (tipoDocumento, numeroDocumento, nombreUsuario, apellidoUsuario, emailUsuario, pwdUsuario,
       telefonoUsuario, direccionUsuario, fechaNacimiento, genero, idRol, idSede, estadoUsuario)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)`
    const params = [
      data.tipoDocumento, data.numeroDocumento, data.nombreUsuario, data.apellidoUsuario,
      data.emailUsuario, data.pwdUsuario, data.telefonoUsuario, data.direccionUsuario,
      data.fechaNacimiento, data.genero, data.idRol, data.idSede
    ]
    const [res]: any = await this.pool.query(sql, params)
    return res.insertId as number
  }

  async updateUser(id: number, data: Partial<Omit<User, 'idUsuario' | 'fechaRegistro'>>): Promise<void> {
    const fields: string[] = []
    const params: any[] = []
    for (const [k, v] of Object.entries(data)) {
      fields.push(`${k} = ?`); params.push(v)
    }
    if (!fields.length) return
    params.push(id)
    const sql = `UPDATE USUARIOS SET ${fields.join(', ')} WHERE idUsuario = ?`
    await this.pool.query(sql, params)
  }
}