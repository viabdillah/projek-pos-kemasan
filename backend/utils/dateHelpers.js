// backend/utils/dateHelpers.js
const getInterval = (period) => {
  switch (period) {
    case 'daily':
      return 'INTERVAL 1 DAY';
    case 'monthly':
      return 'INTERVAL 1 MONTH';
    case 'yearly':
      return 'INTERVAL 1 YEAR';
    case 'weekly':
    default:
      return 'INTERVAL 7 DAY';
  }
};

module.exports = { getInterval };