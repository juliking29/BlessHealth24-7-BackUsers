import { Router } from 'express'
import RouterExpressInterface from '../../../express/domain/RouterExpressInterface'
import AuthController from '../controller/AuthController'
import { ValidateSchema } from '../../../shared/middlewares/ValidateSchema'
import { z } from 'zod'

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
})

const ForgotSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
})

const VerifySchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6)
  })
})

const ResetSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8),
    resetToken: z.string().optional()
  })
})

const GoogleSchema = z.object({
  body: z.object({
    tokenId: z.string().min(1)
  })
})

export default class AuthRouter implements RouterExpressInterface {
  router: Router
  path: string

  constructor(private readonly controller: AuthController) {
    this.router = Router()
    this.path = '/auth'
    console.log('[AuthRouter] path =', this.path)
    this.routes()
  }

  public routes(): void {
    this.router.post('/login', ValidateSchema(LoginSchema), this.controller.login)
    this.router.post('/forgot-password', ValidateSchema(ForgotSchema), this.controller.forgot)
    this.router.post('/verify-reset-code', ValidateSchema(VerifySchema), this.controller.verifyReset)
    this.router.post('/reset-password', ValidateSchema(ResetSchema), this.controller.reset)

    // Nueva ruta Google
    this.router.post('/google', ValidateSchema(GoogleSchema), this.controller.googleLogin)
  }
}