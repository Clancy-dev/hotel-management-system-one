export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `UGX ${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `UGX ${(amount / 1000).toFixed(0)}K`
  }
  return `UGX ${amount.toLocaleString()}`
}
