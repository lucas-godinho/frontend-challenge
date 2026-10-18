let mocksStartup: Promise<void> = Promise.resolve()
let prepareRealtimeMocks: (() => Promise<void>) | undefined

export function setMocksStartup(startup: Promise<unknown>, prepareRealtime?: () => Promise<void>): void {
  mocksStartup = startup.then(() => undefined)
  prepareRealtimeMocks = prepareRealtime
}

export function waitForMocks(): Promise<void> {
  return mocksStartup
}

export async function waitForRealtimeMocks(): Promise<void> {
  await mocksStartup
  await prepareRealtimeMocks?.()
}
