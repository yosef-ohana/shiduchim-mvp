/**
 * Strict date validation for YYYY-MM-DD format and valid month/day values.
 */
export const isValidDateString = (dateString: string): boolean => {
  // Check exact pattern YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Month must be between 1 and 12
  if (month < 1 || month > 12) {
    return false;
  }

  // Day must be valid for the given month and year
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  // Reject unreasonable years outside 2000-2100
  if (year < 2000 || year > 2100) {
    return false;
  }

  return true;
};
