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

  if (!applicantId) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_BODY", message: "Missing applicantId." },
      },
      { status: 400 }
    );
  }

  const selfie = formData.get("selfie");
  const idFront = formData.get("idFront");
  const idBack = formData.get("idBack");
  const passport = formData.get("passport");

  const validIdPair =
    idFront instanceof File && idBack instanceof File && idFront.size > 0 && idBack.size > 0;
  const hasSelfie = selfie instanceof File && selfie.size > 0;
  const hasPassport = passport instanceof File && passport.size > 0;

  if (!hasSelfie && !validIdPair && !hasPassport) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "MISSING_MEDIA",
          message: "Provide a selfie or upload both sides of the ID/passport.",
        },
      },
      { status: 422 }
    );
  }

  try {
    await ensureDirs();
    const stored: string[] = [];
    if (hasSelfie && selfie instanceof File) {
      stored.push(await saveFile(`selfie-${applicantId}`, selfie));
    }
    if (validIdPair && idFront instanceof File && idBack instanceof File) {
      stored.push(await saveFile(`id-front-${applicantId}`, idFront));
      stored.push(await saveFile(`id-back-${applicantId}`, idBack));
    }
    if (hasPassport && passport instanceof File) {
      stored.push(await saveFile(`passport-${applicantId}`, passport));
    }

    await writeLog("selfie_upload", {
      applicantId,
      stored,
      hasSelfie,
      validIdPair,
      hasPassport,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: null, error: { code: "STORE_FAILED", message: "Failed to persist media." } },
      { status: 500 }
    );
  }

  await sleep(800);

  return NextResponse.json({
    data: {
      livenessScore: hasSelfie ? 0.94 : 0.8,
      match: true,
      nextStep: "address",
    },
    error: null,
  });
}
