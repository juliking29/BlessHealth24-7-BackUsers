import { Request, Response, NextFunction } from 'express'

export function IsOwner(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as { sub: number } | undefined
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const idParamRaw = (req.params as Record<string, string | undefined>)['id']
  const paramId = idParamRaw ? Number(idParamRaw) : NaN
  if (!Number.isFinite(paramId)) {
    return res.status(400).json({ error: 'Invalid id param' })
  }

  if (user.sub !== paramId) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  return next()
}