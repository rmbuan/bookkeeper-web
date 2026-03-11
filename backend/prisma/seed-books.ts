import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const titles = [
  "Introduction to Algorithms",
  "Database Systems: The Complete Book",
  "Operating System Concepts",
  "Computer Networks: A Top-Down Approach",
  "Clean Code",
  "Design Patterns",
  "The Pragmatic Programmer",
  "Structure and Interpretation of Computer Programs",
  "Artificial Intelligence: A Modern Approach",
  "Compilers: Principles, Techniques, and Tools",
  "Introduction to the Theory of Computation",
  "Linear Algebra and Its Applications",
  "Calculus: Early Transcendentals",
  "Physics for Scientists and Engineers",
  "Organic Chemistry",
];

const firstNames = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery", "Parker", "Blake", "Cameron", "Drew", "Jamie", "Reese"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore"];

const subjectCodes = ["CS101", "CS201", "MATH141", "MATH241", "PHYS161", "CHEM131", "ENGL101", "HIST105", "BIO150", "ECON200", "STAT400", "CMSC216", "CMSC351"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNum(len: number): string {
  return String(Math.floor(Math.random() * Math.pow(10, len))).padStart(len, "0");
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { isAdmin: true } });
  const userId = admin?.id ?? null;

  const existing = await prisma.book.count();
  if (existing >= 20) {
    console.log("Already have", existing, "books. Skipping seed.");
    return;
  }

  const toCreate = 20 - existing;
  console.log("Creating", toCreate, "random books...");

  for (let i = 0; i < toCreate; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    await prisma.book.create({
      data: {
        bkTitle: pick(titles),
        bkNumber: `BK-${randomNum(5)}`,
        stName: `${firstName} ${lastName}`,
        stNumber: `S${randomNum(6)}`,
        stTaName: `${pick(firstNames)} ${pick(lastNames)}`,
        stTaNumber: `TA-${randomNum(4)}`,
        stSbCode: pick(subjectCodes),
        userId,
      },
    });
  }

  const total = await prisma.book.count();
  console.log("Done. Total books:", total);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
