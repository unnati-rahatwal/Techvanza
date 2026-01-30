const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
console.log('URI:', uri.replace(/:([^:@]{1,})@/, ':****@')); // Log masked URI

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  tls: true,
  tlsAllowInvalidCertificates: true,
  family: 4 // Force IPv4
})
.then(() => {
  console.log('SUCCESS: Connected to MongoDB!');
  process.exit(0);
})
.catch(err => {
  console.error('CONNECTION FAILED:', err);
  process.exit(1);
});
