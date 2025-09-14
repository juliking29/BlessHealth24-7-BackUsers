export const ROLES = {
  PACIENTE: 1,
  DOCTOR: 2,
  OPERADOR: 3,
  ADMIN: 4
} as const

export type RoleId = typeof ROLES[keyof typeof ROLES]