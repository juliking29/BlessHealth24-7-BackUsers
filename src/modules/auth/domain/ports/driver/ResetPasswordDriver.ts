export default interface ResetPasswordDriver {
  execute(resetToken: string, newPassword: string): Promise<{ ok: boolean }>
}