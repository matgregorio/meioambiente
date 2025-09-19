import { app } from '../app.js';
import request from 'supertest';

export const api = () => request(app);
