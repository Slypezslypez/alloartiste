-- Trace l'envoi du rappel envoyé après la fin de l'accès gratuit (code promo), pour ne
-- l'envoyer qu'une seule fois par artiste.
ALTER TABLE "InviteCode" ADD COLUMN "expiredReminderSentAt" TIMESTAMP(3);
