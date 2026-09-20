/**
 * SECURE WEB CRYPTO ADMIN AUTHENTICATION
 * PBKDF2 with SHA-256 derivation (100,000 iterations).
 * Default organizer password: "Admin@Debug2026", Salt: "AGY_DEBUG_SALT_2026"
 */
const DEFAULT_AUTH = {
  saltHex: '4147595f44454255475f53414c545f32303236',
  hashHex: '47675145d92838f06c20cd88ce356cc37b2b99ddf56646268324dbfd43c267b9'
};

async function derivePbkdf2Hash(password, saltHex) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyAdminCredentials(inputPassword) {
  const stored = getAdminAuthSettings();
  try {
    const computed = await derivePbkdf2Hash(inputPassword, stored.saltHex);
    return computed.toLowerCase() === stored.hashHex.toLowerCase();
  } catch (e) {
    console.error('Crypto error:', e);
    return false;
  }
}

function getAdminAuthSettings() {
  const saved = localStorage.getItem('agy_admin_auth');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return DEFAULT_AUTH;
}
