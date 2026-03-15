-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "CompetenceType" AS ENUM ('PROFESSIONAL', 'HSE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'ORDERING', 'IMAGE_PLACEMENT');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('HSE', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ');

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200),
    "password" VARCHAR(300) NOT NULL,
    "lastname_firstname" VARCHAR(200),
    "sap_id" INTEGER NOT NULL,
    "phone" VARCHAR(50),
    "image_path" VARCHAR(300),
    "start_date" DATE,
    "end_date" DATE,
    "hse_blocked" BOOLEAN NOT NULL DEFAULT false,
    "password_changed_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "position_id" TEXT,
    "organisational_unit_id" INTEGER,
    "manager_id" INTEGER,
    "hse_manager_id" INTEGER,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_role" (
    "user_profile_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_profile_role_pkey" PRIMARY KEY ("user_profile_id","role_id")
);

-- CreateTable
CREATE TABLE "organisational_unit" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "organisational_unit_superior_id" INTEGER,

    CONSTRAINT "organisational_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "hse_group_id" TEXT,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hse_group" (
    "id" VARCHAR(200) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "program" VARCHAR(200) NOT NULL,
    "risk_priority" INTEGER,
    "min_question_count_hse" INTEGER,
    "total_question_count_hse" INTEGER,

    CONSTRAINT "hse_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hse_group_competence" (
    "hse_group_id" TEXT NOT NULL,
    "competence_id" TEXT NOT NULL,

    CONSTRAINT "hse_group_competence_pkey" PRIMARY KEY ("hse_group_id","competence_id")
);

-- CreateTable
CREATE TABLE "competence_cluster" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(1000) NOT NULL,
    "type" "CompetenceType",

    CONSTRAINT "competence_cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_family" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(1000) NOT NULL,
    "type" "CompetenceType",
    "competence_cluster_id" INTEGER NOT NULL,

    CONSTRAINT "competence_family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_group" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(1000) NOT NULL,
    "type" "CompetenceType",
    "competence_family_id" INTEGER NOT NULL,

    CONSTRAINT "competence_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(3000) NOT NULL,
    "description" VARCHAR(3000),
    "type" "CompetenceType" NOT NULL,
    "indicator_level" INTEGER,
    "indicator_name" VARCHAR(3000),
    "passing_indicator" INTEGER,
    "competence_group_id" TEXT NOT NULL,
    "responsible_manager_id" INTEGER,

    CONSTRAINT "competence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(5000) NOT NULL,
    "level" INTEGER NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "image_path" VARCHAR(5000),
    "possible_answers" JSONB NOT NULL,
    "correct_answers" JSONB NOT NULL,
    "answer_time" INTEGER,
    "competence_id" TEXT NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_template" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_template_competence" (
    "id" SERIAL NOT NULL,
    "number_of_questions" INTEGER NOT NULL,
    "competence_id" TEXT NOT NULL,
    "test_template_id" INTEGER NOT NULL,

    CONSTRAINT "test_template_competence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_equality" (
    "id" SERIAL NOT NULL,
    "is_num_of_question_per_level_equal" BOOLEAN NOT NULL,
    "competence_id" TEXT NOT NULL,
    "test_template_id" INTEGER,

    CONSTRAINT "competence_equality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "description" VARCHAR(500),
    "type" "TestType" NOT NULL,
    "total_time" INTEGER,
    "iteration" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "parent_test_id" INTEGER,
    "hse_group_id" TEXT,
    "test_template_id" INTEGER,

    CONSTRAINT "test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_question" (
    "test_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "test_question_pkey" PRIMARY KEY ("test_id","question_id")
);

-- CreateTable
CREATE TABLE "test_user_profile" (
    "test_id" INTEGER NOT NULL,
    "user_profile_id" INTEGER NOT NULL,

    CONSTRAINT "test_user_profile_pkey" PRIMARY KEY ("test_id","user_profile_id")
);

-- CreateTable
CREATE TABLE "test_result" (
    "id" SERIAL NOT NULL,
    "passed" BOOLEAN,
    "percentage" DOUBLE PRECISION,
    "date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remaining_time" INTEGER,
    "stopped" BOOLEAN NOT NULL DEFAULT false,
    "test_id" INTEGER NOT NULL,
    "user_profile_id" INTEGER NOT NULL,

    CONSTRAINT "test_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_answer" (
    "id" SERIAL NOT NULL,
    "answer" VARCHAR(5000),
    "correct" BOOLEAN,
    "question_id" INTEGER NOT NULL,
    "test_result_id" INTEGER NOT NULL,

    CONSTRAINT "test_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hse_requirement_rating" (
    "id" SERIAL NOT NULL,
    "fulfill" BOOLEAN,
    "score" INTEGER,
    "competence_id" TEXT NOT NULL,
    "test_id" INTEGER NOT NULL,
    "user_profile_id" INTEGER NOT NULL,

    CONSTRAINT "hse_requirement_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_rating" (
    "id" SERIAL NOT NULL,
    "fulfill" BOOLEAN,
    "rating" DOUBLE PRECISION,
    "test_id" INTEGER NOT NULL,
    "user_profile_id" INTEGER NOT NULL,

    CONSTRAINT "requirement_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "description" VARCHAR(1000),
    "path" VARCHAR(500),
    "info" VARCHAR(5000),
    "table_of_contents" VARCHAR(5000),
    "competence_id" TEXT,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_course" (
    "id" SERIAL NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "start_time" TIMESTAMP(3),
    "user_profile_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "test_id" INTEGER,

    CONSTRAINT "user_profile_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_profile_id" INTEGER NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "action" VARCHAR(200) NOT NULL,
    "entity_type" VARCHAR(200) NOT NULL,
    "entity_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_id" INTEGER NOT NULL,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_username_key" ON "user_profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_sap_id_key" ON "user_profile"("sap_id");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_organisational_unit_id_fkey" FOREIGN KEY ("organisational_unit_id") REFERENCES "organisational_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_hse_manager_id_fkey" FOREIGN KEY ("hse_manager_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_role" ADD CONSTRAINT "user_profile_role_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_role" ADD CONSTRAINT "user_profile_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisational_unit" ADD CONSTRAINT "organisational_unit_organisational_unit_superior_id_fkey" FOREIGN KEY ("organisational_unit_superior_id") REFERENCES "organisational_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_hse_group_id_fkey" FOREIGN KEY ("hse_group_id") REFERENCES "hse_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hse_group_competence" ADD CONSTRAINT "hse_group_competence_hse_group_id_fkey" FOREIGN KEY ("hse_group_id") REFERENCES "hse_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hse_group_competence" ADD CONSTRAINT "hse_group_competence_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_family" ADD CONSTRAINT "competence_family_competence_cluster_id_fkey" FOREIGN KEY ("competence_cluster_id") REFERENCES "competence_cluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_group" ADD CONSTRAINT "competence_group_competence_family_id_fkey" FOREIGN KEY ("competence_family_id") REFERENCES "competence_family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence" ADD CONSTRAINT "competence_competence_group_id_fkey" FOREIGN KEY ("competence_group_id") REFERENCES "competence_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence" ADD CONSTRAINT "competence_responsible_manager_id_fkey" FOREIGN KEY ("responsible_manager_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_template_competence" ADD CONSTRAINT "test_template_competence_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_template_competence" ADD CONSTRAINT "test_template_competence_test_template_id_fkey" FOREIGN KEY ("test_template_id") REFERENCES "test_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_equality" ADD CONSTRAINT "competence_equality_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_equality" ADD CONSTRAINT "competence_equality_test_template_id_fkey" FOREIGN KEY ("test_template_id") REFERENCES "test_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test" ADD CONSTRAINT "test_parent_test_id_fkey" FOREIGN KEY ("parent_test_id") REFERENCES "test"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test" ADD CONSTRAINT "test_hse_group_id_fkey" FOREIGN KEY ("hse_group_id") REFERENCES "hse_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test" ADD CONSTRAINT "test_test_template_id_fkey" FOREIGN KEY ("test_template_id") REFERENCES "test_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_question" ADD CONSTRAINT "test_question_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_question" ADD CONSTRAINT "test_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_user_profile" ADD CONSTRAINT "test_user_profile_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_user_profile" ADD CONSTRAINT "test_user_profile_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_result" ADD CONSTRAINT "test_result_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_result" ADD CONSTRAINT "test_result_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_answer" ADD CONSTRAINT "test_answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_answer" ADD CONSTRAINT "test_answer_test_result_id_fkey" FOREIGN KEY ("test_result_id") REFERENCES "test_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hse_requirement_rating" ADD CONSTRAINT "hse_requirement_rating_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hse_requirement_rating" ADD CONSTRAINT "hse_requirement_rating_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hse_requirement_rating" ADD CONSTRAINT "hse_requirement_rating_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_rating" ADD CONSTRAINT "requirement_rating_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_rating" ADD CONSTRAINT "requirement_rating_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_course" ADD CONSTRAINT "user_profile_course_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_course" ADD CONSTRAINT "user_profile_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_course" ADD CONSTRAINT "user_profile_course_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
