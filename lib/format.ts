export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en-SG", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatKw(value: number) {
  return `${formatNumber(value, 0)} kW`;
}

export function formatKwh(value: number) {
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 2)} GWh`;
  }

  return `${formatNumber(value, 0)} kWh`;
}

export function formatTonnes(value: number) {
  return `${formatNumber(value, 0)} tCO2e`;
}

export function formatLitres(value: number) {
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 2)} ML`;
  }

  return `${formatNumber(value, 0)} L`;
}
