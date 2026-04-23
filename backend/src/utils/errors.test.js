const {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
} = require('./errors');

describe('Error classes', () => {
  describe('AppError', () => {
    it('sets message, statusCode, and code', () => {
      const err = new AppError('something went wrong', 500, 'INTERNAL_ERROR');
      expect(err.message).toBe('something went wrong');
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('INTERNAL_ERROR');
    });

    it('is an instance of Error', () => {
      const err = new AppError('msg', 400, 'CODE');
      expect(err).toBeInstanceOf(Error);
    });
  });

  const cases = [
    { Class: ValidationError,   statusCode: 400, code: 'VALIDATION_ERROR' },
    { Class: UnauthorizedError, statusCode: 401, code: 'UNAUTHORIZED' },
    { Class: ForbiddenError,    statusCode: 403, code: 'FORBIDDEN' },
    { Class: NotFoundError,     statusCode: 404, code: 'NOT_FOUND' },
    { Class: ConflictError,     statusCode: 409, code: 'CONFLICT' },
    { Class: InternalError,     statusCode: 500, code: 'INTERNAL_ERROR' },
  ];

  cases.forEach(({ Class, statusCode, code }) => {
    describe(Class.name, () => {
      it(`has statusCode ${statusCode} and code ${code}`, () => {
        const err = new Class('test message');
        expect(err.statusCode).toBe(statusCode);
        expect(err.code).toBe(code);
        expect(err.message).toBe('test message');
      });

      it('extends AppError', () => {
        expect(new Class()).toBeInstanceOf(AppError);
      });

      it('uses default message when none provided', () => {
        const err = new Class();
        expect(typeof err.message).toBe('string');
        expect(err.message.length).toBeGreaterThan(0);
      });
    });
  });
});
