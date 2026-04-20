import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { internacoesRoutes } from './routes/internacoes.js';
import { analyticsRoutes } from './routes/analytics.js';

export const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: ['http://localhost:3000', 'http://web:3000'] }));

app.route('/api/internacoes', internacoesRoutes);
app.route('/api/analytics', analyticsRoutes);
