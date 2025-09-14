import RouterExpressInterface from '../../../express/domain/RouterExpressInterface'
import AuthRepositoryMySQL from '../repository/AuthRepositoryMySQL'
import AuthService from '../../application/services/AuthService'
import LoginUser from '../../application/use-cases/LoginUser'
import ForgotPassword from '../../application/use-cases/ForgotPassword'
import ResetPassword from '../../application/use-cases/ResetPassword'
import UserRepositoryMySQL from '../../../user/infrastructure/repository/UserRepositoryMySQL'
import AuthController from '../controller/AuthController'
import AuthRouter from '../router/AuthRouter'
import VerifyResetCode from '../../application/use-cases/VerifyResetCode'
import JWTProviderDriver from '../../../shared/utils/JWT'
import BlowfishDriver from '../../../shared/utils/PasswordValidator'
import GoogleLogin from '../../application/use-cases/GoogleLogin'

export default class AuthFactory {
  public static create(): RouterExpressInterface {
    const authRepo = new AuthRepositoryMySQL()
    const jwtDriver = JWTProviderDriver
    const blowfishDriver = BlowfishDriver

    const authService = new AuthService(authRepo, jwtDriver, blowfishDriver)
    const login = new LoginUser(authService)
    const verify = new VerifyResetCode(jwtDriver)
    const userRepo = new UserRepositoryMySQL()

    const forgot = new ForgotPassword(userRepo)
    const reset = new ResetPassword(userRepo, jwtDriver)
    const googleLogin = new GoogleLogin(jwtDriver, authRepo)
    const controller = new AuthController(login, forgot, reset,verify,googleLogin)

    return new AuthRouter(controller)
  }
}