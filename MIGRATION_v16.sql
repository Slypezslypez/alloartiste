CREATE TABLE "InviteCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "usedByArtistId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");

-- 20 codes à usage unique, prêts à distribuer.
INSERT INTO "InviteCode" ("id", "code") VALUES
  (gen_random_uuid()::text, '4RX9F9KV'),
  (gen_random_uuid()::text, '696A4QRD'),
  (gen_random_uuid()::text, '74FWHNTR'),
  (gen_random_uuid()::text, '8RKZR837'),
  (gen_random_uuid()::text, 'A8T8DFJQ'),
  (gen_random_uuid()::text, 'BBA2T25K'),
  (gen_random_uuid()::text, 'BV4KSH8P'),
  (gen_random_uuid()::text, 'E2B3VHQR'),
  (gen_random_uuid()::text, 'GPP3VYXA'),
  (gen_random_uuid()::text, 'MANEVJJF'),
  (gen_random_uuid()::text, 'NUXJ7QQW'),
  (gen_random_uuid()::text, 'P2TD4TTQ'),
  (gen_random_uuid()::text, 'PNTYK2FU'),
  (gen_random_uuid()::text, 'QUDTZJ6D'),
  (gen_random_uuid()::text, 'QX659KQG'),
  (gen_random_uuid()::text, 'SRYYACWS'),
  (gen_random_uuid()::text, 'TK3UHDFB'),
  (gen_random_uuid()::text, 'UJD9YUVE'),
  (gen_random_uuid()::text, 'VX5W2772'),
  (gen_random_uuid()::text, 'XST8JR64');
