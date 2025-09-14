import { NextFunction, Request, Response } from 'express'
import { HTTPERROR } from '../utils/HTTPERROR'
import { RoleId } from '../config/constants'

export function RoleMiddleware(allowed: RoleId[]) {
  return function(req: Request, _res: Response, next: NextFunction) {
    const roleId = (req as any).auth?.roleId as number | undefined
    if (!roleId) return next(new HTTPERROR(403, 'Forbidden'))
    if (!allowed.includes(roleId as RoleId)) return next(new HTTPERROR(403, 'Forbidden'))
    next()
  }
}