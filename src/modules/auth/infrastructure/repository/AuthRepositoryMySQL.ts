import BaseMySQLRepository from '../../../relational-database/infrastructure/repository-base/BaseMySQLRepository'
import IAuthRepository from '../../domain/interfaces/IAuthRepository'
import { User } from '../../../user/domain/entities/User'

export default class AuthRepositoryMySQL extends BaseMySQLRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.query('SELECT * FROM USUARIOS WHERE emailUsuario = ? LIMIT 1', [email])
    const list = rows as any[]
    return list.length ? (list[0] as User) : null
  }
}