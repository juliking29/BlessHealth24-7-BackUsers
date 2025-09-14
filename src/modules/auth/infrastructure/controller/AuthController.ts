import { Request, Response, NextFunction } from 'express'
import LoginUser from '../../application/use-cases/LoginUser'
import ForgotPassword from '../../application/use-cases/ForgotPassword'
import ResetPassword from '../../application/use-cases/ResetPassword'
import VerifyResetCode from '../../application/use-cases/VerifyResetCode'
import GoogleLogin from '../../application/use-cases/GoogleLogin'

export default class AuthController {
  constructor(
    private readonly loginUC: LoginUser,
    private readonly forgotUC: ForgotPassword,
    private readonly resetUC: ResetPassword,
    private readonly verifyUC: VerifyResetCode,
    private readonly googleUC: GoogleLogin
  ) {}

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as { email: string; password: string }
      const result = await this.loginUC.execute({ email, password })
      return res.json(result)
    } catch (e) { return next(e) }
  }

  public forgot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string }
      const result = await this.forgotUC.execute(email)
      return res.json(result)
    } catch (e) { return next(e) }
  }

  public verifyReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body as { email: string; code: string }
      const result = await this.verifyUC.execute(email, code)
      return res.json(result)
    } catch (e) { return next(e) }
  }

  public reset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.headers.authorization
      const tokenFromHeader = auth?.startsWith('Bearer ') ? auth.substring(7) : undefined
      const { newPassword, resetToken: tokenFromBody } = req.body as { newPassword: string; resetToken?: string }
      const resetToken = tokenFromHeader ?? tokenFromBody
      if (!resetToken) return res.status(400).json({ error: 'Missing reset token' })
      const result = await this.resetUC.execute(resetToken, newPassword)
      return res.json(result)
    } catch (e) { return next(e) }
  }

  public googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tokenId } = req.body as { tokenId: string }
    const result = await this.googleUC.execute(tokenId)
    return res.json(result)
  } catch (e) { return next(e) }
}
}