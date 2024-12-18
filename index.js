import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import debug from 'debug';
const debugServer = debug('app:Server');

import { userRouter } from './routes/api/user.js';
import { bugRouter } from './routes/api/bug.js';
import { authMiddleware } from '@merlin4/express-auth';

import cookieParser from 'cookie-parser';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(_dirname, 'frontend/dist')));

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,               
}));

app.use(cookieParser());

app.use(
  authMiddleware(process.env.JWT_SECRET, 'authToken', {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/api/user', userRouter);
app.use('/api/bug', bugRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(_dirname, 'frontend', 'dist', 'index.html'));
});

const port = process.env.PORT || 2024;
app.listen(port, () => {
  debugServer(`Server is now running on http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  res.status(err.status).json({error: err.message});
});