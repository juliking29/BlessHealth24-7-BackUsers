export default interface BiometricLoginDriver {
  execute(biometricData: any): Promise<{ token: string; provider: 'biometric' }>
}