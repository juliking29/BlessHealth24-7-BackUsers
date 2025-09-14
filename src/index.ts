import UserRouterFactory from './modules/user/infrastructure/factory/UserFactory'
import AuthRouterFactory from './modules/auth/infrastructure/factory/AuthFactory'
import ServerFactory from './modules/express/infrastructure/factory/ServerFactory'
import './modules/shared/config/env'
// Instanciar los routers usando sus factories
const usersRouterFactory = UserRouterFactory.create()
const authRouterFactory = AuthRouterFactory.create()

// Agregar los routers a la lista de rutas
const routesFactory = [usersRouterFactory, authRouterFactory]

// Crear el servidor con las rutas
const server = ServerFactory.create(routesFactory)

// Inicializar la base de datos y arrancar el servidor
server.initDB()
server.start()

console.log('ENV check:', {
  DB_HOST: process.env['DB_HOST'],
  DB_PORT: process.env['DB_PORT'],
  DB_SSL: process.env['DB_SSL'],
  JWT_ACCESS_SECRET: process.env['JWT_ACCESS_SECRET'],
  JWT_ACCESS_TTL: process.env['JWT_ACCESS_TTL']
})