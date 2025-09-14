import { NextFunction, Request, Response } from 'express'
import { HTTPERROR } from '../utils/HTTPERROR'
import JWTProviderDriver from '../utils/JWT'

export function AuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ')) {
      throw new HTTPERROR(401, 'Missing Bearer token')
    }

    const token = authHeader.substring(7).trim()
    if (!token) {
      throw new HTTPERROR(401, 'Missing Bearer token')
    }

    const decoded: any = JWTProviderDriver.verify(token)
    // Algunos drivers podrían devolver un objeto con distintos formatos; normalizamos:
    const p = (decoded && typeof decoded === 'object' && 'sub' in decoded)
      ? decoded
      : (decoded?.payload ?? decoded)

    const user = {
      sub: Number(p?.sub),
      email: String(p?.email ?? ''),
      roleId: Number(p?.roleId ?? 0),
    }

    if (!Number.isFinite(user.sub)) {
      throw new HTTPERROR(401, 'Unauthorized')
    }

    // Guardamos en ambos para compatibilidad
    ;(req as any).user = user
    ;(req as any).auth = user

    return next()
  } catch (e: any) {
    const message = e?.message ?? 'Unauthorized'
    return next(new HTTPERROR(401, message))
  }
}