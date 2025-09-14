import mysql, { Pool, PoolOptions } from 'mysql2/promise'
import IRelationalDatabase from '../../domain/IRelationalDatabase'

function envStr(key: string, fallback?: string): string {
  const v = process.env[key]
  if (v === undefined || v === null || v === '') {
    if (fallback !== undefined) return fallback
    throw new Error(`Missing required env var: ${key}`)
  }
  return v
}

function envNum(key: string, fallback?: number): number {
  const v = process.env[key]
  if (v === undefined || v === null || v === '') {
    if (fallback !== undefined) return fallback
    throw new Error(`Missing required env var: ${key}`)
  }
  const n = Number(v)
  if (Number.isNaN(n)) throw new Error(`Env var ${key} must be a number`)
  return n
}

export default class RelationalDataBase implements IRelationalDatabase {
  private static instance: RelationalDataBase
  private pool!: Pool

  private constructor() {
    const isSSL = (process.env['DB_SSL'] ?? 'false').toLowerCase() === 'true'

    // Lee y fuerza tipos no undefined
    const host = envStr('DB_HOST')
    const user = envStr('DB_USER')
    const password = envStr('DB_PASSWORD')
    const database = envStr('DB_NAME')
    const port = envNum('DB_PORT', 3306)

    const config: PoolOptions = {
      host,
      user,
      password,
      database,
      port,
      connectionLimit: 10,
      decimalNumbers: true
    }

    if (isSSL) {
      // En Aiven basta rejectUnauthorized false si no montas CA
      config.ssl = { rejectUnauthorized: false }
    }

    this.pool = mysql.createPool(config)
  }

  public static getInstance(): RelationalDataBase {
    if (!RelationalDataBase.instance) {
      RelationalDataBase.instance = new RelationalDataBase()
    }
    return RelationalDataBase.instance
  }

  public getPool(): Pool {
    return this.pool
  }

  public async ping(): Promise<void> {
    const conn = await this.pool.getConnection()
    try {
      await conn.ping()
    } finally {
      conn.release()
    }
  }
}