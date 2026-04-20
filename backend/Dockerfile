# ── Stage 1: builder ──────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate


# ── Stage 2: runner ───────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/node_modules    ./node_modules
COPY --from=builder /app/generated       ./generated
COPY --from=builder /app/src             ./src
COPY --from=builder /app/scripts         ./scripts
COPY --from=builder /app/prisma/schema.prisma      ./prisma/schema.prisma
COPY --from=builder /app/prisma/migrations         ./prisma/migrations

COPY docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
