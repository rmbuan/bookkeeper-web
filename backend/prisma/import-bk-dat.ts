import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RECORD_LEN = 7 * 40; // 280 bytes per record (VB6 String * 40 each)

function parseRecord(buffer: Buffer, offset: number): {
  bkTitle: string;
  bkNumber: string;
  stName: string;
  stNumber: string;
  stTaName: string;
  stTaNumber: string;
  stSbCode: string;
} {
  const decode = (start: number, len: number) =>
    buffer
      .subarray(offset + start, offset + start + len)
      .toString("latin1")
      .replace(/\0/g, "")
      .trim();
  return {
    bkTitle: decode(0, 40),
    bkNumber: decode(40, 40),
    stName: decode(80, 40),
    stNumber: decode(120, 40),
    stTaName: decode(160, 40),
    stTaNumber: decode(200, 40),
    stSbCode: decode(240, 40),
  };
}

async function main() {
  const pathArg = process.argv[2];
  const defaultPath = resolve(process.cwd(), "..", "..", "bk.dat");
  const filePath = pathArg ? resolve(pathArg) : defaultPath;

  if (!existsSync(filePath)) {
    console.error("File not found:", filePath);
    console.error("Usage: npx tsx prisma/import-bk-dat.ts [path-to-bk.dat]");
    process.exit(1);
  }

  const buffer = readFileSync(filePath);
  const numRecords = Math.floor(buffer.length / RECORD_LEN);
  console.log("Found", numRecords, "records in", filePath);

  const admin = await prisma.user.findFirst({ where: { isAdmin: true } });
  const userId = admin?.id ?? null;

  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < numRecords; i++) {
    const rec = parseRecord(buffer, i * RECORD_LEN);
    const empty =
      !rec.bkTitle && !rec.bkNumber && !rec.stName && !rec.stNumber && !rec.stTaName && !rec.stTaNumber && !rec.stSbCode;
    if (empty) {
      skipped++;
      continue;
    }
    await prisma.book.create({
      data: {
        bkTitle: rec.bkTitle.slice(0, 200),
        bkNumber: rec.bkNumber.slice(0, 200),
        stName: rec.stName.slice(0, 200),
        stNumber: rec.stNumber.slice(0, 200),
        stTaName: rec.stTaName.slice(0, 200),
        stTaNumber: rec.stTaNumber.slice(0, 200),
        stSbCode: rec.stSbCode.slice(0, 200),
        userId,
      },
    });
    imported++;
  }

  console.log("Imported:", imported, "Skipped empty:", skipped);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
