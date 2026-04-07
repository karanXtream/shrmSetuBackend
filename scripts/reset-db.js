import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

const resetDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing collections...');
    
    // Drop all indexes
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      try {
        await collection.deleteMany({});
        console.log(`✅ Cleared collection: ${key}`);
      } catch (error) {
        console.error(`❌ Error clearing ${key}:`, error.message);
      }
    }

    console.log('\n🔧 Rebuilding indexes...');
    // Get all model names
    const models = mongoose.modelNames();
    for (const modelName of models) {
      try {
        const model = mongoose.model(modelName);
        await model.collection.dropIndexes();
        await model.syncIndexes();
        console.log(`✅ Rebuilt indexes for: ${modelName}`);
      } catch (error) {
        console.log(`⚠️  ${modelName}: ${error.message}`);
      }
    }

    console.log('\n✅ Database reset complete!');
    console.log('You can now register users with any phone/email\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

// Import models before running
import User from '../src/models/User.js';
import Worker from '../src/models/Worker.js';
import Location from '../src/models/Location.js';
import Media from '../src/models/Media.js';
import Skill from '../src/models/Skill.js';
import WorkerSkill from '../src/models/WorkerSkill.js';

resetDatabase();
