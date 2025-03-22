import request from 'supertest';
import express from 'express';
import * as db from './testdb';
import userRoutes from '../../backend/routes/userRoutes';
import User from '../../backend/models/User.model';

const app = express();
app.use(express.json());
app.use('/api', userRoutes);


// tests here for userRoutes.js - problem timeout with mongo memory server


