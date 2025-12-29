import { NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const missing = [
    "email",
    "phone",
    "firstName",
    "lastName",
    "dob",
    "gender",
    "addressStreet",
    "addressCity",
    "addressRegion",
    "addressPostalCode",
    "addressCountry",
  ].filter((field) => !body?.[field]);

  if (missing.length) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INVALID_BODY",
          message: `Missing fields: ${missing.join(", ")}`,
        },
      },
      { status: 400 }
    );
  }

  await sleep(700);

  return NextResponse.json({
    data: {
      applicantId: `app_${Date.now()}`,
      otpChannels: ["email", "sms"],
    },
    error: null,
  });
}
