// import mongoose from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';


// const mongod = MongoMemoryServer.create();

// export const connect = async () => {

//    const uri = await (await mongod).getUri();
//    await mongoose.connect(uri, {
//       serverSelectionTimeoutMS: 5000, // Reduce timeout to fail faster if there's an issue
//     });
//     console.log("Mongo Db connected");

//   mongoose.connection.on('connected', () => console.log('Mongoose connection established'));
//   mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
// }

// export const closeDatabase = async () => {
//    await mongoose.connection.dropDatabase();
//    await mongoose.connection.close();
//    await (await mongod).stop();
// }

// export const clearDatabase = async () => {
//    const collections = mongoose.connection.collections;
//    for (const key in collections) {
//       const collection = collections[key];
//       await collection.deleteMany({});
//       const result = await collection.deleteMany({});
//       console.log(`Cleared ${result.deletedCount} documents from ${key}`);
//    }
// }
// import mongoose from '../';
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
