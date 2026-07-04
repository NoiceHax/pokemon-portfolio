/**
 * One-time TOTP setup helper for the admin Control Room.
 *
 * Generates a base32 TOTP secret + an otpauth:// URI. Put the secret in TOTP_SECRET, and
 * either paste the otpauth URI into your authenticator app or turn it into a QR code
 * (e.g. paste into any "otpauth to QR" tool). Also prints a fresh SESSION_SECRET.
 *
 * Run: node scripts/gen-totp.cjs
 */
const crypto = require('crypto')

function base32Encode(buf) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const b of buf) bits += b.toString(2).padStart(8, '0')
  let out = ''
  for (let i = 0; i + 5 <= bits.length; i += 5) out += alphabet[parseInt(bits.slice(i, i + 5), 2)]
  return out
}

const secret = base32Encode(crypto.randomBytes(20))
const label = encodeURIComponent('Trainer Chandan Control Room')
const issuer = encodeURIComponent('TrainerChandan')
const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`

console.log('\nTOTP_SECRET=' + secret)
console.log('\notpauth URI (add to your authenticator app / make a QR):')
console.log(uri)
console.log('\nSESSION_SECRET=' + crypto.randomBytes(32).toString('hex'))
console.log('\nSet ADMIN_PASSWORD to a strong password of your choice.\n')
