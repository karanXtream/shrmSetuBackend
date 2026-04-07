import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

console.log('🔄 Loading .env from:', envPath);
const envConfig = dotenv.config({ path: envPath });
console.log('✅ Env loaded:', !!envConfig.parsed);

console.log('MONGODB_URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');

// Connect to MongoDB
await connectDB();

// Import app AFTER MongoDB is configured
import app from '../app.js';

const PORT = 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
});