-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'DATE', 'SIGNATURE', 'CHECKBOX');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('CREATED', 'APPROVED', 'SENT', 'SIGNED', 'LOCKED', 'REVOKED');

-- CreateTable
CREATE TABLE "blueprints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blueprint_fields" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "label" TEXT NOT NULL,
    "positionX" INTEGER NOT NULL DEFAULT 0,
    "positionY" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blueprint_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_values" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contract_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_audit_logs" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "fromStatus" "ContractStatus" NOT NULL,
    "toStatus" "ContractStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blueprints_createdAt_idx" ON "blueprints"("createdAt");

-- CreateIndex
CREATE INDEX "blueprint_fields_blueprintId_idx" ON "blueprint_fields"("blueprintId");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_createdAt_idx" ON "contracts"("createdAt");

-- CreateIndex
CREATE INDEX "contracts_blueprintId_idx" ON "contracts"("blueprintId");

-- CreateIndex
CREATE INDEX "contract_values_contractId_idx" ON "contract_values"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_values_contractId_fieldId_key" ON "contract_values"("contractId", "fieldId");

-- CreateIndex
CREATE INDEX "contract_audit_logs_contractId_idx" ON "contract_audit_logs"("contractId");

-- AddForeignKey
ALTER TABLE "blueprint_fields" ADD CONSTRAINT "blueprint_fields_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_values" ADD CONSTRAINT "contract_values_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
