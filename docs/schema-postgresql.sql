-- CVET: esquema PostgreSQL de referência
-- Compatível com PostgreSQL 16+. Execute em um banco vazio.

BEGIN;

CREATE TYPE "EspeciePet" AS ENUM ('CANINO', 'FELINO', 'OUTROS');

CREATE TABLE "Usuario" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "cpf" TEXT UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "senhaHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Tutor" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "telefone" TEXT NOT NULL,
  "cpf" TEXT,
  "email" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Pet" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "especie" "EspeciePet" NOT NULL,
  "raca" TEXT,
  "dataNascimento" TIMESTAMP,
  "tutorId" TEXT NOT NULL REFERENCES "Tutor"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Raca" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "especie" "EspeciePet" NOT NULL,
  "grupoFci" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("nome", "especie")
);

CREATE TABLE "Leito" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'N' CHECK ("tipo" IN ('N', 'I')),
  "valorDiaria" DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK ("valorDiaria" >= 0),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Internacao" (
  "id" TEXT PRIMARY KEY,
  "petNome" TEXT NOT NULL,
  "especie" TEXT NOT NULL,
  "tutorNome" TEXT NOT NULL,
  "entradaEm" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataSaida" TIMESTAMP,
  "descricao" TEXT NOT NULL DEFAULT '',
  "quantidadeDiarias" INTEGER NOT NULL DEFAULT 0 CHECK ("quantidadeDiarias" >= 0),
  "valorDiarias" DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK ("valorDiarias" >= 0),
  "status" TEXT NOT NULL DEFAULT 'estavel' CHECK ("status" IN ('estavel', 'observacao', 'critico')),
  "baixa" BOOLEAN NOT NULL DEFAULT FALSE,
  "proximaMedicacao" TEXT NOT NULL DEFAULT '',
  "observacao" TEXT NOT NULL DEFAULT '',
  "petId" TEXT REFERENCES "Pet"("id"),
  "leitoId" TEXT REFERENCES "Leito"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("dataSaida" IS NULL OR "dataSaida" >= "entradaEm")
);

CREATE TABLE "Medicacao" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "descricao" TEXT NOT NULL DEFAULT '',
  "horarios" TEXT NOT NULL DEFAULT '[]',
  "cor" TEXT NOT NULL DEFAULT 'bg-teal-500',
  "via" TEXT NOT NULL DEFAULT 'Oral',
  "unidade" TEXT NOT NULL DEFAULT 'mg',
  "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 1 CHECK ("quantidade" > 0),
  "valorDose" DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK ("valorDose" >= 0),
  "dosesAplicadas" INTEGER NOT NULL DEFAULT 0 CHECK ("dosesAplicadas" >= 0),
  "frequenciaHoras" INTEGER NOT NULL DEFAULT 8 CHECK ("frequenciaHoras" > 0),
  "primeiroHorario" TEXT NOT NULL DEFAULT '08:00',
  "fimEm" TIMESTAMP,
  "internacaoId" TEXT NOT NULL REFERENCES "Internacao"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "FormaPagamento" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Pagamento" (
  "id" TEXT PRIMARY KEY,
  "valor" DOUBLE PRECISION NOT NULL CHECK ("valor" > 0),
  "pagoEm" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "internacaoId" TEXT NOT NULL REFERENCES "Internacao"("id") ON DELETE CASCADE,
  "formaPagamentoId" TEXT NOT NULL REFERENCES "FormaPagamento"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Pet_tutorId_idx" ON "Pet"("tutorId");
CREATE INDEX "Internacao_petId_idx" ON "Internacao"("petId");
CREATE INDEX "Internacao_leitoId_idx" ON "Internacao"("leitoId");
CREATE INDEX "Internacao_baixa_idx" ON "Internacao"("baixa");
CREATE INDEX "Medicacao_internacaoId_idx" ON "Medicacao"("internacaoId");
CREATE INDEX "Pagamento_internacaoId_idx" ON "Pagamento"("internacaoId");

INSERT INTO "FormaPagamento" ("id", "nome") VALUES
  ('dinheiro', 'Dinheiro'), ('credito', 'Crédito'), ('debito', 'Débito'),
  ('pix', 'PIX'), ('transferencia', 'Transferência');

COMMIT;