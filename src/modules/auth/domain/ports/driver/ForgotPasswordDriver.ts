export default interface ForgotPasswordDriver {
  execute(email: string): Promise<{ ok: boolean }>
}