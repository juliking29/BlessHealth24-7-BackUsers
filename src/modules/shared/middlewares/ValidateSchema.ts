import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'
import { HTTPERROR } from '../utils/HTTPERROR'

export function ValidateSchema(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query })
    if (!result.success) {
      const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
      return next(new HTTPERROR(400, msg))
    }
    next()
  }
}