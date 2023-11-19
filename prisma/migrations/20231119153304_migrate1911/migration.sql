-- CreateTable
CREATE TABLE "User" (
    "userID" SERIAL NOT NULL,
    "userName" TEXT,
    "userEmail" TEXT,
    "userPhone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Events" (
    "eventID" SERIAL NOT NULL,
    "eventName" TEXT,
    "eventLocation" TEXT,
    "eventAdress" TEXT,
    "eventCoordinates" TEXT,
    "userIDCreate" INTEGER NOT NULL,
    "eventDate" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("eventID")
);

-- CreateTable
CREATE TABLE "_userFavorites" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userEmail_key" ON "User"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "_userFavorites_AB_unique" ON "_userFavorites"("A", "B");

-- CreateIndex
CREATE INDEX "_userFavorites_B_index" ON "_userFavorites"("B");

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_userIDCreate_fkey" FOREIGN KEY ("userIDCreate") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFavorites" ADD CONSTRAINT "_userFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Events"("eventID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFavorites" ADD CONSTRAINT "_userFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
