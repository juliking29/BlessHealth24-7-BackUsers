import RelationalDataBase from '../mysql/RelationalDataBase'
import { Pool } from 'mysql2/promise'

export default abstract class BaseMySQLRepository {
  protected pool: Pool
  constructor() {
    this.pool = RelationalDataBase.getInstance().getPool()
  }
}