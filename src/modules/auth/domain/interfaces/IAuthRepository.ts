import { User } from '../../../user/domain/entities/User'

export interface BiometricDevice {
  userId: number
  deviceId: string
  deviceName: string
  deviceType: 'ios' | 'android' | 'web'
  isActive: boolean
  isRevoked?: boolean
  registeredAt: Date
  lastUsedAt?: Date
  additionalData?: {
    appleUserIdentifier?: string
    biometricType?: 'face_id' | 'touch_id'
  }
}

export interface AppleUserCreateData {
  email: string
  appleUserIdentifier: string
  name: string
  isEmailVerified: boolean
}

export default interface IAuthRepository {
  // Métodos existentes
  findUserByEmail(email: string): Promise<User | null>
  findUserById(userId: number): Promise<User | null>
  
  // Nuevos métodos para Apple
  findUserByAppleIdentifier(appleUserIdentifier: string): Promise<User | null>
  createUserFromApple(data: AppleUserCreateData): Promise<User>
  linkAppleAccount(userId: number, appleUserIdentifier: string): Promise<void>
  
  // Métodos de dispositivos biométricos
  getBiometricDevice(userId: number, deviceId: string): Promise<BiometricDevice | null>
  registerBiometricDevice(device: BiometricDevice): Promise<void>
  recordBiometricLoginAttempt(
    userId: number, 
    deviceId: string, 
    success: boolean, 
    message: string
  ): Promise<void>
  updateBiometricDeviceUsage(deviceId: string, userId: number): Promise<void>
}