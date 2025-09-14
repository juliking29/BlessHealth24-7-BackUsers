import RouterExpressInterface from '../../../express/domain/RouterExpressInterface'
import UserRepositoryMySQL from '../repository/UserRepositoryMySQL'
import UserService from '../../application/services/UserService'
import RegisterUser from '../../application/use-cases/RegisterUser'
import GetUserProfile from '../../application/use-cases/GetUserProfile'
import UpdateUser from '../../application/use-cases/UpdateUser'
import UserController from '../controller/UserController'
import UserRouter from '../router/UserRouter'
import BlowfishDriver from '../../../shared/utils/PasswordValidator'

export default class UserFactory {
  public static create(): RouterExpressInterface {
    const repo = new UserRepositoryMySQL()
    const blowfish = BlowfishDriver
    const service = new UserService(repo, blowfish)
    const register = new RegisterUser(service)
    const profile = new GetUserProfile(service)
    const update = new UpdateUser(service)
    const controller = new UserController(register, profile, update)
    return new UserRouter(controller)
  }
}