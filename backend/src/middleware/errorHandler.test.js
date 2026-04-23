const errorHandler = require('./errorHandler');
const {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
} = require('../utils/errors');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler middleware', () => {
  const req = {};
  const next = jest.fn();

  test('handles AppError subclasses with correct statusCode and code', () => {
    const cases = [
      { err: new ValidationError('bad input'), status: 400, code: 'VALIDATION_ERROR' },
      { err: new UnauthorizedError('no token'), status: 401, code: 'UNAUTHORIZED' },
      { err: new ForbiddenError('no access'), status: 403, code: 'FORBIDDEN' },
      { err: new NotFoundError('missing'), status: 404, code: 'NOT_FOUND' },
      { err: new ConflictError('duplicate'), status: 409, code: 'CONFLICT' },
      { err: new InternalError('boom'), status: 500, code: 'INTERNAL_ERROR' },
    ];

    for (const { err, status, code } of cases) {
      const res = mockRes();
      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code, message: err.message },
      });
    }
  });

  test('handles generic AppError with custom statusCode and code', () => {
    const err = new AppError('custom error', 422, 'CUSTOM_CODE');
    const res = mockRes();
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'CUSTOM_CODE', message: 'custom error' },
    });
  });

  test('handles Mongoose ValidationError (err.name === "ValidationError")', () => {
    const err = { name: 'ValidationError', message: 'Path `email` is required.' };
    const res = mockRes();
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Path `email` is required.' },
    });
  });

  test('handles Mongoose duplicate key error (err.code === 11000)', () => {
    const err = { code: 11000, message: 'E11000 duplicate key error' };
    const res = mockRes();
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'CONFLICT', message: 'Duplicate key error' },
    });
  });

  test('returns 500 for unknown errors', () => {
    const err = new Error('something unexpected');
    const res = mockRes();
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  test('response always has success: false', () => {
    const errors = [
      new ValidationError(),
      { name: 'ValidationError', message: 'x' },
      { code: 11000 },
      new Error('generic'),
    ];
    for (const err of errors) {
      const res = mockRes();
      errorHandler(err, req, res, next);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
    }
  });
});
