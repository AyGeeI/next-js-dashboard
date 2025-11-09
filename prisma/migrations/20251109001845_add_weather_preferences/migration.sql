-- CreateTable
CREATE TABLE "weather_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weather_preferences_userId_key" ON "weather_preferences"("userId");

-- AddForeignKey
ALTER TABLE "weather_preferences" ADD CONSTRAINT "weather_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
