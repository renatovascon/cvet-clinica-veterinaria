-- CreateTable
CREATE TABLE "Internacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petNome" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "tutorNome" TEXT NOT NULL,
    "entradaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'estavel',
    "proximaMedicacao" TEXT NOT NULL,
    "observacao" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
