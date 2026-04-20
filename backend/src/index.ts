import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { internacoesRoutes } from './routes/internacoes.js';
import { analyticsRoutes } from './routes/analytics.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: ['http://localhost:3000', 'http://web:3000'] }));

app.route('/api/internacoes', internacoesRoutes);
app.route('/api/analytics', analyticsRoutes);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`CVET API rodando em http://localhost:${port}`);
});
