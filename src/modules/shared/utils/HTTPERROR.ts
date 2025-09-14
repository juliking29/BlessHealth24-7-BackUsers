export class HTTPERROR extends Error {
  status: number
  code: string | undefined

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code ?? undefined
    Object.setPrototypeOf(this, HTTPERROR.prototype)
  }
}
export default HTTPERROR