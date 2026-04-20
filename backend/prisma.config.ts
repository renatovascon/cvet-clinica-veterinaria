import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node scripts/init-db.mjs',
  },
  datasource: {
    url: 'file:./prisma/dev.db',
  },
});
