const StellarSdk = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');

function getPublicKey(alias) {
  const confPath = path.join(process.env.USERPROFILE, '.config', 'stellar', 'identity', alias + '.toml');
  const content = fs.readFileSync(confPath, 'utf8');
  const match = content.match(/seed_phrase\s*=\s*"([^"]+)"/);
  if (match) {
    const seedPhrase = match[1];
    const words = seedPhrase.split(' ');
    const keypair = StellarSdk.Keypair.fromSecret(StellarSdk.MnemonicPhrase.decodeUtf8(seedPhrase).phrase);
    return keypair.publicKey();
  }
  return null;
}

console.log('CLIENT:', getPublicKey('testclient'));
console.log('ARTIST:', getPublicKey('testartist'));
console.log('ADMIN:', getPublicKey('testadmin'));
