type Entry = {
  code: string
  expiresAt: number
  used: boolean
  userId?: number // <-- opcional
}

class InMemoryResetStore {
  // email -> Entry
  private static store: Map<string, Entry> = new Map()

  static set(email: string, code: string, ttlMs: number, userId?: number) {
    const expiresAt = Date.now() + ttlMs
    const entry: Entry = {
      code,
      expiresAt,
      used: false,
      ...(userId !== undefined ? { userId } : {}) // solo incluir si viene
    }
    InMemoryResetStore.store.set(email, entry)
  }

  static get(email: string): Entry | undefined {
    const e = InMemoryResetStore.store.get(email)
    if (!e) return undefined
    if (e.expiresAt <= Date.now()) {
      InMemoryResetStore.store.delete(email)
      return undefined
    }
    return e
  }

  static markUsed(email: string) {
    const e = InMemoryResetStore.store.get(email)
    if (e) {
      e.used = true
      InMemoryResetStore.store.set(email, e)
    }
  }

  static invalidate(email: string) {
    InMemoryResetStore.store.delete(email)
  }
}

export default InMemoryResetStore