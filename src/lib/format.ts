export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions = {},
) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}
