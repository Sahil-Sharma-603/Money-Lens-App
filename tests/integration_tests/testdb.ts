import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';


const mongod = MongoMemoryServer.create();

export const connect = async () => {

   const uri = await (await mongod).getUri();
   // await mongoose.connect(uri);
   await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Reduce timeout to fail faster if there's an issue
    });
    console.log("Mongo Db connected");

  mongoose.connection.on('connected', () => console.log('Mongoose connection established'));
  mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
}

export const closeDatabase = async () => {
   await mongoose.connection.dropDatabase();
   await mongoose.connection.close();
   await (await mongod).stop();
}

export const clearDatabase = async () => {
   const collections = mongoose.connection.collections;
   for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      const result = await collection.deleteMany({});
      console.log(`Cleared ${result.deletedCount} documents from ${key}`);
   }
}