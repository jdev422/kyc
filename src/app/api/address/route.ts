import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const uploadsDir = path.join(process.cwd(), "uploads");
const logsDir = path.join(process.cwd(), "logs");
const logFile = path.join(logsDir, "api.log");

async function ensureDirs() {
  await Promise.all([fs.mkdir(uploadsDir, { recursive: true }), fs.mkdir(logsDir, { recursive: true })]);
}

async function saveFile(prefix: string, file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = path.extname(file.name || "") || ".bin";
  const safeName = `${prefix}-${crypto.randomUUID()}${ext}`;
  const target = path.join(uploadsDir, safeName);
  await fs.writeFile(target, buffer);
  return target;
}

async function writeLog(message: string, meta: Record<string, unknown>) {
  const line = `${new Date().toISOString()} ${message} ${JSON.stringify(meta)}\n`;
  await fs.appendFile(logFile, line);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const applicantId = formData.get("applicantId");
  const document = formData.get("document");
  const docType = formData.get("docType");
  const issuer = formData.get("issuer");
  const issueDate = formData.get("issueDate");

  if (!applicantId) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_BODY", message: "Missing applicantId." },
      },
      { status: 400 }
    );
  }

  if (!(document instanceof File) || document.size === 0) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "MISSING_DOCUMENT", message: "Upload a document." },
      },
      { status: 400 }
    );
  }

  if (!docType || !issuer || !issueDate) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INVALID_BODY",
          message: "Document type, issuer, and issue date are required.",
        },
      },
      { status: 400 }
    );
  }

  try {
    await ensureDirs();
    const storedPath = await saveFile(`address-${applicantId}`, document);
    await writeLog("address_upload", {
      applicantId,
      storedPath,
      docType,
      issuer,
      issueDate,
      size: document.size,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: null, error: { code: "STORE_FAILED", message: "Failed to persist document." } },
      { status: 500 }
    );
  }

  await sleep(900);

  return NextResponse.json({
    data: {
      parsedAddress: {
        line1: "123 Market St",
        city: "San Francisco",
        region: "CA",
        postalCode: "94105",
        country: formData.get("country") || "US",
      },
      issuer,
      status: "submitted",
    },
    error: null,
  });
}
