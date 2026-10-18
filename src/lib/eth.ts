function parseWei(value: string): bigint {
  const [whole = '0', fraction = ''] = value.split('.')
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fraction)) throw new Error(`Invalid ETH amount: ${value}`)
  return BigInt(`${whole}${fraction.padEnd(18, '0')}`)
}

export function multiplyEth(value: string, quantity: number): string {
  const wei = parseWei(value) * BigInt(quantity)
  const whole = wei / 10n ** 18n
  const fraction = (wei % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '').padEnd(2, '0')
  return `${whole}.${fraction}`
}

export function sumEth(values: Array<{ amount: string; quantity: number }>): string {
  const wei = values.reduce((sum, value) => sum + parseWei(value.amount) * BigInt(value.quantity), 0n)
  const whole = wei / 10n ** 18n
  const fraction = (wei % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '').padEnd(2, '0')
  return `${whole}.${fraction}`
}
