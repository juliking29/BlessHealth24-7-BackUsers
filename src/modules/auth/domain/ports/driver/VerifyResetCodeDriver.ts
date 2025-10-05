export default interface VerifyResetCodeDriver {
  execute(email: string, code: string): Promise<{ ok: boolean; resetToken: string }>
}
