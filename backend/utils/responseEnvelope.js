/**
 * Standardized API response envelope.
 * Every API response follows this format for consistency.
 */

const success = (res, { data = null, message = 'Success', statusCode = 200, pagination = null }) => {
  const response = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

const error = (res, { message = 'Something went wrong', statusCode = 500, code = 'INTERNAL_ERROR', errors = null }) => {
  const response = { success: false, message, code };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const paginated = (res, { data, page, limit, total, message = 'Success' }) => {
  return success(res, {
    data,
    message,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
};

module.exports = { success, error, paginated };
