import jwt from 'jsonwebtoken';
const args = process.argv.slice(2);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'YOUR_GENERATED_SECRET_HERE') {
  console.error('ERROR: JWT_SECRET not configured. Set JWT_SECRET environment variable.');
  process.exit(1);
}

args.forEach(arg => {
  try {
    const decoded = jwt.verify(arg, JWT_SECRET);
    console.log('Token verified successfully');
    console.log('Decoded:', JSON.stringify(decoded, null, 2));
  } catch (e) {
    console.log('Token verification failed:', e.message);
  }
});
