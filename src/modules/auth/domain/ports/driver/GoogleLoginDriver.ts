export default interface GoogleLoginDriver {
  execute(idToken: string): Promise<{ token: string; provider: 'google' }>
}