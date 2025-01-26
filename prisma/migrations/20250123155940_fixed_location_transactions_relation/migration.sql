-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'income',
    "category" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL,
    "locationId" TEXT,
    CONSTRAINT "Transaction_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "category", "categoryIcon", "createAt", "date", "description", "id", "type", "updateAt", "userId") SELECT "amount", "category", "categoryIcon", "createAt", "date", "description", "id", "type", "updateAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_locationId_idx" ON "Transaction"("locationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
