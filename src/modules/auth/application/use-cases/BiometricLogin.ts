import IAuthRepository, { BiometricDevice } from '../../domain/interfaces/IAuthRepository'
import IJwtDriverPort from '../../domain/interfaces/IJwtDriverPort'

interface BiometricRequest {
  identityToken: string // JWT de Apple Sign In
  authorizationCode: string // Código de autorización de Apple
  userIdentifier: string // ID único del usuario de Apple
  deviceId: string
  email?: string // Email opcional (Apple puede ocultarlo)
  firstName?: string // Nombre opcional
  lastName?: string // Apellido opcional
}

interface AppleIdentityTokenPayload {
  iss: string // "https://appleid.apple.com"
  aud: string // Bundle ID de tu app
  exp: number // Expiración
  iat: number // Emitido en
  sub: string // ID único del usuario
  c_hash: string // Código hash
  email?: string // Email (puede estar ausente)
  email_verified?: boolean // Si el email está verificado
  is_private_email?: boolean // Si es un email privado
  auth_time: number // Tiempo de autenticación
  nonce_supported: boolean // Soporte para nonce
}

export default class BiometricLogin {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly jwt: IJwtDriverPort
  ) {}

  async execute(request: BiometricRequest) {
    const { identityToken, authorizationCode, userIdentifier, deviceId, email, firstName, lastName } = request

    if (!identityToken || !userIdentifier || !deviceId) {
      throw new Error('Token de identidad, userIdentifier y deviceId son requeridos')
    }

    // Validar el token de Apple
    const payload = await this.validateAppleIdentityToken(identityToken)
    
    // Buscar o crear usuario
    const user = await this.findOrCreateUserFromApplePayload(
      payload, 
      userIdentifier, 
      email, 
      firstName, 
      lastName
    )
    
    if (!user) {
      throw new Error('No se pudo encontrar o crear el usuario')
    }

    // Verificar si el dispositivo está registrado
    const isDeviceRegistered = await this.verifyBiometricDevice(user.idUsuario, deviceId)
    
    if (!isDeviceRegistered) {
      // Registrar el dispositivo en el primer uso
      await this.registerBiometricDevice(
        user.idUsuario, 
        deviceId, 
        'Dispositivo iOS',
        userIdentifier
      )
    } else {
      // Actualizar último uso del dispositivo
      await this.authRepo.updateBiometricDeviceUsage(deviceId, user.idUsuario)
    }

    // Registrar el intento de login exitoso
    await this.authRepo.recordBiometricLoginAttempt(
      user.idUsuario, 
      deviceId, 
      true, 
      'Login biométrico iOS exitoso'
    )

    // Crear payload JWT
    const jwtPayload = { 
      sub: user.idUsuario, 
      email: user.emailUsuario, 
      roleId: user.idRol,
      authType: 'biometric',
      deviceId: deviceId,
      provider: 'ios-biometric',
      appleUserIdentifier: userIdentifier
    }

    // Generar token JWT de nuestra aplicación
    const token = this.jwt.sign(jwtPayload)

    return { 
      token,
      user: {
        id: user.idUsuario,
        email: user.emailUsuario,
        name: user.nombreUsuario,
        role: user.idRol
      },
      provider: 'biometric'
    }
  }

  private async validateAppleIdentityToken(identityToken: string): Promise<AppleIdentityTokenPayload> {
    const jwt = require('jsonwebtoken')
    const jwksClient = require('jwks-rsa')
    
    // Configuración para Apple
    const APPLE_BUNDLE_ID = process.env['APPLE_BUNDLE_ID']
    const APPLE_TEAM_ID = process.env['APPLE_TEAM_ID']
    
    if (!APPLE_BUNDLE_ID) {
      throw new Error('APPLE_BUNDLE_ID no configurado')
    }

    try {
      // Obtener las claves públicas de Apple
      const client = jwksClient({
        jwksUri: 'https://appleid.apple.com/auth/keys',
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 24 * 60 * 60 * 1000 // 24 horas
      })

      // Función para obtener la signing key
      function getKey(header: any, callback: any) {
        client.getSigningKey(header.kid, (err: any, key: any) => {
          if (err) {
            callback(err, null)
          } else {
            const signingKey = key.publicKey || key.rsaPublicKey
            callback(null, signingKey)
          }
        })
      }

      // Verificar el token
      return new Promise((resolve, reject) => {
        jwt.verify(identityToken, getKey, {
          algorithms: ['RS256'],
          audience: APPLE_BUNDLE_ID,
          issuer: 'https://appleid.apple.com'
        }, (err: any, decoded: any) => {
          if (err) {
            reject(new Error(`Token de Apple inválido: ${err.message}`))
          } else {
            // Validaciones adicionales
            const currentTime = Math.floor(Date.now() / 1000)
            if (decoded.exp < currentTime) {
              reject(new Error('Token de Apple expirado'))
            }
            resolve(decoded as AppleIdentityTokenPayload)
          }
        })
      })

    } catch (error: any) {
      console.error('Error validando token de Apple:', error)
      throw new Error('Token de Apple inválido: ' + error.message)
    }
  }

  private async findOrCreateUserFromApplePayload(
    payload: AppleIdentityTokenPayload,
    userIdentifier: string,
    email?: string,
    firstName?: string,
    lastName?: string
  ) {
    // Primero intentar buscar por Apple User ID
    let user = await this.authRepo.findUserByAppleIdentifier(userIdentifier)
    
    // Si no existe, buscar por email
    if (!user && payload.email) {
      user = await this.authRepo.findUserByEmail(payload.email)
    }
    
    // Si no existe, buscar por email proporcionado
    if (!user && email) {
      user = await this.authRepo.findUserByEmail(email)
    }

    // Si aún no existe, crear nuevo usuario
    if (!user) {
      const userEmail = payload.email || email || `${userIdentifier}@privaterelay.appleid.com`
      const userName = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : 'Usuario iOS'
      
      user = await this.authRepo.createUserFromApple({
        email: userEmail,
        appleUserIdentifier: userIdentifier,
        name: userName,
        isEmailVerified: payload.email_verified || false
      })
    } else {
      // Actualizar la información de Apple si el usuario ya existe
      await this.authRepo.linkAppleAccount(user.idUsuario, userIdentifier)
    }

    return user
  }

  private async verifyBiometricDevice(userId: number, deviceId: string): Promise<boolean> {
    try {
      const device = await this.authRepo.getBiometricDevice(userId, deviceId)
      const isRevoked = device?.isRevoked ?? false
      return !!(device && device.isActive && !isRevoked)
    } catch (error: any) {
      console.error('Error verificando dispositivo biométrico:', error)
      return false
    }
  }

  private async registerBiometricDevice(
    userId: number, 
    deviceId: string, 
    deviceName: string,
    appleUserIdentifier: string
  ) {
    try {
      const deviceData: BiometricDevice = {
        userId,
        deviceId,
        deviceName: deviceName || 'Dispositivo iOS',
        deviceType: 'ios',
        isActive: true,
        isRevoked: false,
        registeredAt: new Date(),
        additionalData: {
          appleUserIdentifier,
          biometricType: 'face_id' // o 'touch_id'
        }
      }

      await this.authRepo.registerBiometricDevice(deviceData)
    } catch (error: any) {
      console.error('Error registrando dispositivo biométrico:', error)
      throw new Error('No se pudo registrar el dispositivo biométrico: ' + error.message)
    }
  }

  // Método opcional para verificar el código de autorización
  private async validateAuthorizationCode(authorizationCode: string): Promise<boolean> {
    // Apple recomienda validar el código de autorización
    // Esto requiere hacer una llamada a la API de Apple
    try {
      const response = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env['APPLE_BUNDLE_ID']!,
          client_secret: this.generateAppleClientSecret(),
          code: authorizationCode,
          grant_type: 'authorization_code',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return !!data.access_token
      }
      return false
    } catch (error) {
      console.error('Error validando código de autorización de Apple:', error)
      return false
    }
  }

  private generateAppleClientSecret(): string {
    // Generar client secret para Apple
    // Esto requiere tu Team ID, Bundle ID, y una clave privada
    const jwt = require('jsonwebtoken')
    
    const APPLE_TEAM_ID = process.env['APPLE_TEAM_ID']
    const APPLE_BUNDLE_ID = process.env['APPLE_BUNDLE_ID']
    const APPLE_PRIVATE_KEY = process.env['APPLE_PRIVATE_KEY']
    const APPLE_KEY_ID = process.env['APPLE_KEY_ID']

    if (!APPLE_TEAM_ID || !APPLE_BUNDLE_ID || !APPLE_PRIVATE_KEY || !APPLE_KEY_ID) {
      throw new Error('Configuración de Apple incompleta')
    }

    return jwt.sign({
      iss: APPLE_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15777000, // 6 meses
      aud: 'https://appleid.apple.com',
      sub: APPLE_BUNDLE_ID
    }, APPLE_PRIVATE_KEY, {
      algorithm: 'ES256',
      keyid: APPLE_KEY_ID
    })
  }
}