const mongoose = require('../../backend/models/User.model').model('User').base;
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connect = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
  console.log('Mongo Db connected');
  console.log('Mongo URI:', uri);

  // Wait for stable connection
  await new Promise<void>((resolve, reject) => {
    if (mongoose.connection.readyState === 1) return resolve();

    mongoose.connection.once('connected', () => {
      console.log('Mongoose connection is ready');
      resolve();
    });

    mongoose.connection.once('error', (err: Error) => {
      console.error('Mongoose connection error:', err);
      reject(err);
    });
  });
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Mongo Db closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
};

export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (Object.prototype.hasOwnProperty.call(collections, key)) {
      await collections[key].deleteMany({});
    }
  }
};