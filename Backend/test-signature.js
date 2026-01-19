/**
 * TEST: Signature Generation Verification
 * 
 * This test verifies the backend signature generation matches Cloudinary expectations
 */

const crypto = require('crypto');

// Use the same credentials from .env
const CLOUD_NAME = 'dapsxeewd';
const API_KEY = '811883241953341';
const API_SECRET = 'gOTwhM_KmbRZV05hR8x9H9jF-yM';

function generateSignature(timestamp, folder = 'use-and-sell/products') {
  const params = {
    folder,
    timestamp,
  };

  // Create string to sign: all params in alphabetical order, joined with &
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&') + API_SECRET;

  console.log('String to sign:', stringToSign);

  // SHA1 hash
  const signature = crypto
    .createHash('sha1')
    .update(stringToSign)
    .digest('hex');

  return { 
    signature, 
    apiKey: API_KEY, 
    cloudName: CLOUD_NAME,
    timestamp,
    folder,
  };
}

// Test with current timestamp
const timestamp = Math.floor(Date.now() / 1000);
const result = generateSignature(timestamp);

console.log('\n✅ Signature Test Result:');
console.log('Timestamp:', result.timestamp);
console.log('Signature:', result.signature);
console.log('API Key:', result.apiKey);
console.log('Cloud Name:', result.cloudName);
console.log('Folder:', result.folder);

// Test with a known timestamp
console.log('\n--- Test with fixed timestamp 1765024099 ---');
const fixedResult = generateSignature(1765024099);
console.log('Signature:', fixedResult.signature);
console.log('Expected: e335471bc27c56f046c0ac086c78668cac738bad (from error)');
