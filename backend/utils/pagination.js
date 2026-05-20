/**
 * Parse and validate pagination parameters from query string.
 * Returns safe defaults if values are missing or invalid.
 */
const parsePagination = (query, defaults = {}) => {
  const maxLimit = defaults.maxLimit || 100;
  const defaultLimit = defaults.limit || 20;
  const defaultPage = defaults.page || 1;

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = defaultPage;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = { parsePagination };
