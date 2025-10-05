export default class BiometricLogin{
  async execute(_biometricData: string) {
    // TODO: integración biométrica
    return { ok: true, provider: 'biometric' }
  }
}