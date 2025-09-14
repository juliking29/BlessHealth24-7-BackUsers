import { Request, Response, NextFunction } from 'express'
import RegisterUser from '../../application/use-cases/RegisterUser'
import GetUserProfile from '../../application/use-cases/GetUserProfile'
import UpdateUser from '../../application/use-cases/UpdateUser'

export default class UserController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly getProfileUC: GetUserProfile,
    private readonly updateUserUC: UpdateUser
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.registerUser.execute(req.body)
      res.status(201).json(result)
    } catch (e) { next(e) }
  }

  public profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).auth as { sub: number }
      const data = await this.getProfileUC.execute(auth.sub)
      res.json(data)
    } catch (e) { next(e) }
  }

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      await this.updateUserUC.execute(Number(id), req.body)
      res.json({ ok: true })
    } catch (e) { next(e) }
  }
}