-- Add JSON-string field for scholarship custom key-value details
ALTER TABLE "Scholarship"
ADD COLUMN "additionalInfo" TEXT;
