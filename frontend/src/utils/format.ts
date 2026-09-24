/**
 * Format currency in Indian Rupees (INR)
 * Example: 2499 -> ₹2,499
 */
export const formatPrice = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
