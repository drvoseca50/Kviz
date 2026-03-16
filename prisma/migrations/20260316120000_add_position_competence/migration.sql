-- CreateTable
CREATE TABLE "position_competence" (
    "position_id" VARCHAR(255) NOT NULL,
    "competence_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "position_competence_pkey" PRIMARY KEY ("position_id","competence_id")
);

-- AddForeignKey
ALTER TABLE "position_competence" ADD CONSTRAINT "position_competence_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_competence" ADD CONSTRAINT "position_competence_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
