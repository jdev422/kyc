import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { isPrimaryIdentityDocType } from "@/lib/kyc/id-doc-types";

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
  const documents: Array<{ docType: string; front: File; back: File }> = [];

  if (typeof applicantId !== "string" || !applicantId) {
    return NextResponse.json(
      { data: null, error: { code: "INVALID_BODY", message: "Missing applicantId." } },
      { status: 400 }
    );
  }

  for (let index = 0; index < 2; index += 1) {
    const docTypeRaw =
      formData.get(`docType_${index}`) ??
      (index === 0 ? formData.get("docType") ?? formData.get("docType_0") : null);
    const docType = typeof docTypeRaw === "string" ? docTypeRaw : "";

    const front =
      formData.get(`front_${index}`) ??
      (index === 0 ? formData.get("idFront") ?? formData.get("front_0") : null);
    const back =
      formData.get(`back_${index}`) ??
      (index === 0 ? formData.get("idBack") ?? formData.get("back_0") : null);

    if (!docType.trim()) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "INVALID_BODY",
            message: `Missing docType for document ${index + 1}.`,
          },
        },
        { status: 400 }
      );
    }

    if (!(front instanceof File) || front.size <= 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "MISSING_DOCUMENT",
            message: `Missing front image for document ${index + 1}.`,
          },
        },
        { status: 400 }
      );
    }

    if (!(back instanceof File) || back.size <= 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "MISSING_DOCUMENT",
            message: `Missing back image for document ${index + 1}.`,
          },
        },
        { status: 400 }
      );
    }

    documents.push({ docType, front, back });
  }

  if (!documents.some((doc) => isPrimaryIdentityDocType(doc.docType))) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "MISSING_PRIMARY_ID",
          message:
            "At least one uploaded document must be a passport, driver’s license, or identification card.",
        },
      },
      { status: 400 }
    );
  }

  try {
    await ensureDirs();
    const stored: string[] = [];
    for (const [index, doc] of documents.entries()) {
      stored.push(await saveFile(`id-doc-${index}-front-${applicantId}`, doc.front));
      stored.push(await saveFile(`id-doc-${index}-back-${applicantId}`, doc.back));
    }

    await writeLog("id_docs_upload", {
      applicantId,
      stored,
      documents: documents.map((doc) => ({
        docType: doc.docType,
        sizes: { front: doc.front.size, back: doc.back.size },
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: null, error: { code: "STORE_FAILED", message: "Failed to persist ID documents." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { status: "uploaded" },
    error: null,
  });
}
