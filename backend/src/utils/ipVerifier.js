/**
 * IP_Verifier utility
 * Compares two IPv4 addresses to determine if they share the same subnet
 * (first three octets match).
 */

/**
 * Validates and extracts the first three octets from an IPv4 address.
 * Returns null if the input is malformed or not a valid IPv4 address.
 * @param {string} ip
 * @returns {string|null}
 */
function extractSubnet(ip) {
  if (typeof ip !== 'string') return null;
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  for (const part of parts) {
    if (part === '' || !/^\d+$/.test(part)) return null;
    const num = Number(part);
    if (num < 0 || num > 255) return null;
  }
  return parts.slice(0, 3).join('.');
}

/**
 * Returns true if ip1 and ip2 share the same first three octets (same /24 subnet).
 * Returns false for any malformed or non-IPv4 input without throwing.
 * @param {string} ip1
 * @param {string} ip2
 * @returns {boolean}
 */
function sameSubnet(ip1, ip2) {
  const subnet1 = extractSubnet(ip1);
  const subnet2 = extractSubnet(ip2);
  if (subnet1 === null || subnet2 === null) return false;
  return subnet1 === subnet2;
}

module.exports = { sameSubnet };
