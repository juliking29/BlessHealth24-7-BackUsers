import { Router } from 'express'
import RouterExpressInterface from '../../../express/domain/RouterExpressInterface'
import UserController from '../controller/UserController'
import { ValidateSchema } from '../../../shared/middlewares/ValidateSchema'
import { z } from 'zod'
import { AuthMiddleware } from '../../../shared/middlewares/AuthMiddleware'
import { IsOwner } from '../../../shared/middlewares/IsOwner'

const RegisterSchema = z.object({
  body: z.object({
    tipoDocumento: z.number().int().positive(),
    numeroDocumento: z.string().min(3),
    nombreUsuario: z.string().min(1),
    apellidoUsuario: z.string().min(1),
    emailUsuario: z.string().email(),
    password: z.string().min(8),
    telefonoUsuario: z.string().min(7),
    direccionUsuario: z.string().min(3),
    idRol: z.number().int().positive(),
    idSede: z.number().int().positive().nullable().optional(),
    fechaNacimiento: z.string().nullable().optional(),
    genero: z.enum(['M', 'F']).nullable().optional()
  })
})

const UpdateSchema = z.object({
  body: z.object({
    nombreUsuario: z.string().min(1).optional(),
    emailUsuario: z.string().email().optional(),
    pwdUsuario: z.string().min(8).optional(),
    estadoUsuario: z.number().int().min(0).max(1).optional(),
    telefonoUsuario: z.string().min(7).optional(),
    direccionUsuario: z.string().min(3).optional(),
    idSede: z.number().int().positive().nullable().optional()
  })
})

export default class UserRouter implements RouterExpressInterface {
  router: Router
  path: string

  constructor(private readonly controller: UserController) {
    this.router = Router()
    this.path = '/users'
    console.log('[UserRouter] path =', this.path)
    this.routes()
  }

  public routes(): void {
    // Registro público
    this.router.post('/', ValidateSchema(RegisterSchema), this.controller.register)

    // Perfil autenticado
    this.router.get('/me', AuthMiddleware, this.controller.profile)

    // Update: cualquier usuario puede actualizar SU propio registro
    this.router.patch('/:id',
      AuthMiddleware,
      IsOwner,                 // <-- solo dueño, sin roles
      ValidateSchema(UpdateSchema),
      this.controller.update
    )
  }
}