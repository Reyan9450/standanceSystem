const { sign, verify } = require('./jwt');
const { UnauthorizedError } = require('./errors');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

describe('sign', () => {
  test('returns a string token', () => {
    const token = sign({ userId: '123', role: 'student' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('verify', () => {
  test('returns the original payload', () => {
    const payload = { userId: '123', role: 'teacher' };
    const token = sign(payload);
    const decoded = verify(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  test('throws UnauthorizedError for invalid token', () => {
    expect(() => verify('not.a.valid.token')).toThrow(UnauthorizedError);
  });

  test('throws UnauthorizedError for expired token', () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ userId: '456' }, process.env.JWT_SECRET, { expiresIn: -1 });
    expect(() => verify(expired)).toThrow(UnauthorizedError);
  });
});
