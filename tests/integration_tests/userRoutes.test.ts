import request from 'supertest';
import express from 'express';
import * as db from './testdb';
import userRoutes from '../../backend/routes/userRoutes';
import User from '../../backend/models/User.model';

const app = express();
app.use(express.json());
app.use('/api', userRoutes);


// tests here for userRoutes.js - problem timeout with mongo memory server

describe("UserRoutes Integration test", ()=>{
    beforeAll(async () => {
        await db.connect();
      }, 10000);
      afterEach(async () => {
        await db.clearDatabase();
      }, 10000);
      afterAll(async () => {
        await db.closeDatabase();
      }, 10000);

      test("Testing The GET /signup", async () =>{

        const testUser = {
            firstName: "TestUser1",
            lastName: "lastname",
            email: "test@gmail.com",
            firebaseUid: "18y8y28egbdiq"
        }

        console.log("Test user", testUser);
        const response = await request(app).post('/api/signup').send(testUser);
        expect(response.status).toBe(201);


      });
})