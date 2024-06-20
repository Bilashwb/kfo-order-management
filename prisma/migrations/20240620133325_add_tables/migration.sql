-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineItemId" TEXT,
    "inventoryType" TEXT,
    "orderId" TEXT,
    "status" TEXT,
    "promiseDate" TEXT,
    "reciveStock" TEXT,
    "readyDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineItemId" TEXT,
    "orderId" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false
);
