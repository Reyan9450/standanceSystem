const { sameSubnet } = require('./ipVerifier');

describe('sameSubnet', () => {
  describe('same subnet', () => {
    test('returns true for identical IPs', () => {
      expect(sameSubnet('192.168.1.1', '192.168.1.1')).toBe(true);
    });
    test('returns true when only the last octet differs', () => {
      expect(sameSubnet('192.168.1.1', '192.168.1.254')).toBe(true);
    });
    test('returns true for 10.0.0.x subnet', () => {
      expect(sameSubnet('10.0.0.1', '10.0.0.99')).toBe(true);
    });
  });

  describe('different subnet', () => {
    test('returns false when third octet differs', () => {
      expect(sameSubnet('192.168.1.1', '192.168.2.1')).toBe(false);
    });
    test('returns false when first octet differs', () => {
      expect(sameSubnet('192.168.1.1', '10.168.1.1')).toBe(false);
    });
  });

  describe('malformed input', () => {
    test('returns false for empty string', () => {
      expect(sameSubnet('', '192.168.1.1')).toBe(false);
    });
    test('returns false for null', () => {
      expect(sameSubnet(null, '192.168.1.1')).toBe(false);
    });
    test('returns false for too few octets', () => {
      expect(sameSubnet('192.168.1', '192.168.1.1')).toBe(false);
    });
    test('returns false for non-numeric octets', () => {
      expect(sameSubnet('192.168.abc.1', '192.168.1.1')).toBe(false);
    });
    test('does not throw for any malformed input', () => {
      const malformed = [null, undefined, '', 'abc', '1.2.3', 123, {}, []];
      for (const bad of malformed) {
        expect(() => sameSubnet(bad, '192.168.1.1')).not.toThrow();
      }
    });
  });

  describe('symmetry', () => {
    test('is symmetric for same-subnet IPs', () => {
      expect(sameSubnet('192.168.1.10', '192.168.1.20')).toBe(sameSubnet('192.168.1.20', '192.168.1.10'));
    });
    test('is symmetric for different-subnet IPs', () => {
      expect(sameSubnet('192.168.1.1', '10.0.0.1')).toBe(sameSubnet('10.0.0.1', '192.168.1.1'));
    });
  });
});
