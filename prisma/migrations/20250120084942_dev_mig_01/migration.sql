-- CreateTable
CREATE TABLE "UserSetting" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "currency" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'income'
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'income',
    "category" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "squareFeet" REAL NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "yearBuilt" INTEGER NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "currentValue" REAL NOT NULL,
    "monthlyRent" REAL,
    "propertyType" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MonthHistory" (
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" REAL NOT NULL,
    "expense" REAL NOT NULL,

    PRIMARY KEY ("day", "month", "year", "userId")
);

-- CreateTable
CREATE TABLE "YearHistory" (
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" REAL NOT NULL,
    "expense" REAL NOT NULL,

    PRIMARY KEY ("month", "year", "userId")
);

-- CreateTable
CREATE TABLE "Properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purpose" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "rooms" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "area" REAL NOT NULL,
    "rentFrequency" TEXT,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "furnishingStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_userId_type_key" ON "Category"("name", "userId", "type");
