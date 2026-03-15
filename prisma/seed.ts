import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { RoleName } from "../src/generated/prisma/enums";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

async function main() {
  console.log("Seeding database...");

  // --- Roles ---
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN },
  });
  const managerRole = await prisma.role.upsert({
    where: { name: RoleName.MANAGER },
    update: {},
    create: { name: RoleName.MANAGER },
  });
  const userRole = await prisma.role.upsert({
    where: { name: RoleName.USER },
    update: {},
    create: { name: RoleName.USER },
  });
  console.log("Roles created:", adminRole.name, managerRole.name, userRole.name);

  // --- Organisational Units ---
  const hqUnit = await prisma.organisationalUnit.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Headquarters" },
  });
  const opsUnit = await prisma.organisationalUnit.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "Operations", superiorId: hqUnit.id },
  });
  console.log("Org units created:", hqUnit.name, opsUnit.name);

  // --- HSE Group ---
  const hseGroup = await prisma.hseGroup.upsert({
    where: { id: "hse-general" },
    update: {},
    create: {
      id: "hse-general",
      name: "General HSE",
      program: "HSE-2026",
      riskPriority: 1,
    },
  });
  console.log("HSE group created:", hseGroup.name);

  // --- Positions ---
  const posEngineer = await prisma.position.upsert({
    where: { id: "pos-engineer" },
    update: {},
    create: {
      id: "pos-engineer",
      name: "Engineer",
      hseGroupId: hseGroup.id,
    },
  });
  const posTechnician = await prisma.position.upsert({
    where: { id: "pos-technician" },
    update: {},
    create: {
      id: "pos-technician",
      name: "Technician",
      hseGroupId: hseGroup.id,
    },
  });
  console.log("Positions created:", posEngineer.name, posTechnician.name);

  // --- Users ---
  const tempPassword = await bcrypt.hash("Admin@12345678901", SALT_ROUNDS);

  const admin = await prisma.userProfile.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@testikko.local",
      password: tempPassword,
      lastNameFirstName: "Admin User",
      sapId: 10001,
      organisationalUnitId: hqUnit.id,
      passwordChangedAt: null, // force password change on first login
    },
  });
  await prisma.userProfileRole.upsert({
    where: { userProfileId_roleId: { userProfileId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userProfileId: admin.id, roleId: adminRole.id },
  });
  console.log("Admin created:", admin.username);

  const manager = await prisma.userProfile.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      username: "manager",
      email: "manager@testikko.local",
      password: await bcrypt.hash("Manager@1234567890", SALT_ROUNDS),
      lastNameFirstName: "Manager User",
      sapId: 10002,
      organisationalUnitId: hqUnit.id,
      positionId: posEngineer.id,
      passwordChangedAt: null,
    },
  });
  await prisma.userProfileRole.upsert({
    where: { userProfileId_roleId: { userProfileId: manager.id, roleId: managerRole.id } },
    update: {},
    create: { userProfileId: manager.id, roleId: managerRole.id },
  });
  console.log("Manager created:", manager.username);

  const user1 = await prisma.userProfile.upsert({
    where: { username: "john.doe" },
    update: {},
    create: {
      username: "john.doe",
      email: "john.doe@testikko.local",
      password: await bcrypt.hash("JohnDoe@123456789", SALT_ROUNDS),
      lastNameFirstName: "Doe John",
      sapId: 10003,
      organisationalUnitId: opsUnit.id,
      positionId: posEngineer.id,
      managerId: manager.id,
      passwordChangedAt: null,
    },
  });
  await prisma.userProfileRole.upsert({
    where: { userProfileId_roleId: { userProfileId: user1.id, roleId: userRole.id } },
    update: {},
    create: { userProfileId: user1.id, roleId: userRole.id },
  });
  console.log("User created:", user1.username);

  const user2 = await prisma.userProfile.upsert({
    where: { username: "jane.smith" },
    update: {},
    create: {
      username: "jane.smith",
      email: "jane.smith@testikko.local",
      password: await bcrypt.hash("JaneSmith@1234567", SALT_ROUNDS),
      lastNameFirstName: "Smith Jane",
      sapId: 10004,
      organisationalUnitId: opsUnit.id,
      positionId: posTechnician.id,
      managerId: manager.id,
      passwordChangedAt: null,
    },
  });
  await prisma.userProfileRole.upsert({
    where: { userProfileId_roleId: { userProfileId: user2.id, roleId: userRole.id } },
    update: {},
    create: { userProfileId: user2.id, roleId: userRole.id },
  });
  console.log("User created:", user2.username);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
