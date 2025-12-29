# KYC Frontend Integration Guide (Next.js)

Backend exposes a public KYC API under the `/kyc` prefix (no JWT required).

## Base URL

- Local: `http://localhost:<PORT>` (default `5050`, check backend `.env` `PORT`)
- Routes are relative to that base (examples below).

### Recommended local dev setup (avoid CORS)

- Set `KYC_API_BASE_URL=http://localhost:5050`
- Frontend calls `/kyc/...` and Next.js rewrites proxy to the backend.

### Alternative (direct browser calls)

- Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:5050`
- Frontend calls `http://localhost:5050/kyc/...`
- Backend must allow CORS from the frontend origin.

## Response Envelope

All KYC endpoints return one of:

- Success: `{ "data": <payload>, "error": null }`
- Error: `{ "data": null, "error": { "code": string, "message": string, "details"?: any } }`

Frontend should treat any non-2xx as error and read `error.code/message`.

## 1) Register applicant (identity + address)

`POST /kyc/register`

Content-Type: `application/json`

Body:

```json
{
  "firstName": "Jane",
  "middleName": "Marie",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "dob": "1990-01-01",
  "gender": "female",
  "addressStreet": "123 Market St",
  "addressCity": "San Francisco",
  "addressRegion": "CA",
  "addressPostalCode": "94105",
  "addressCountry": "US"
}
```

Response:

```json
{ "data": { "applicantId": "app_..." }, "error": null }
```

## 2) Upload selfie

`POST /kyc/selfie`

Content-Type: `multipart/form-data`

Fields:

- `applicantId`: string
- `selfie`: file (`image/jpeg` or `image/png`)

Response:

```json
{ "data": { "status": "uploaded" }, "error": null }
```

Limits:

- Max file size: 10MB

## 3) Upload ID docs (2 document types; each front + back)

`POST /kyc/id-docs`

Content-Type: `multipart/form-data`

Fields:

- `applicantId`: string
- `docType_0`: string (must match allowed list)
- `front_0`: file (`image/jpeg` or `image/png`)
- `back_0`: file (`image/jpeg` or `image/png`)
- `docType_1`: string (must match allowed list)
- `front_1`: file (`image/jpeg` or `image/png`)
- `back_1`: file (`image/jpeg` or `image/png`)

Notes:

- All 4 images are required.
- At least one of `docType_0` / `docType_1` must be a “primary” ID type (passport/driver’s license/ID card family).

Response:

```json
{ "data": { "status": "uploaded" }, "error": null }
```

Limits:

- Max file size: 10MB per file
- File types: JPG/PNG only (HEIC/WebP not supported)

## 4) Upload proof of address

`POST /kyc/address`

Content-Type: `multipart/form-data`

Fields:

- `applicantId`: string
- `document`: file (`application/pdf` OR `image/jpeg` OR `image/png`)
- `docType`: string (e.g. `utility-bill`)
- `issuer`: string
- `country`: string (optional)
- `issueDate`: `YYYY-MM-DD`

Response:

```json
{ "data": { "status": "submitted" }, "error": null }
```

Limits:

- Max file size: 10MB

## Allowed `docType_*` values (ID docs)

Use one of these exact strings:

- Passport
- Driver’s License
- Foreign Driver’s License
- Foreign Passport
- BC Driver’s License and Services Card
- Photo BC Services Card
- Permanent Resident (PR) Card
- Citizenship Card
- Secure Certificated of Indian Status Card
- National Institute of The Blind(CNIB) Identification Card
- Federal, Provincial or Municipal Identification Card
- Military Family Card
- Firearms Acquisition Certificate (FAC) or Possession/Acquisition License (PAL)
- Provincial or Territorial Health Cards
- Government Employment Card
- International Student Card
- Age of Majority Card
- Birth Certificate
- Baptismal Certificate
- Non-Photo BC Services Card
- Hunting License
- Fishing License
- Boating License
- LCBO/Age of Majority Card
- Outdoors Card
- Hospital Card
- Blood Donor Card
- Immigration Papers
- Student ID
- City/Municipal Library Card

## Minimal Next.js `fetch` examples

### Register (JSON)

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/kyc/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const json = await res.json();
if (!res.ok) throw new Error(json?.error?.message || "KYC register failed");
const applicantId = json.data.applicantId as string;
```

### Upload (multipart)

```ts
const form = new FormData();
form.set("applicantId", applicantId);
form.set("selfie", file); // or document/front_0/etc

const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/kyc/selfie`, {
  method: "POST",
  body: form,
});
const json = await res.json();
if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
```

## Error codes (common)

- `VALIDATION_ERROR` (400)
- `APPLICANT_NOT_FOUND` (404)
- `UNSUPPORTED_MEDIA_TYPE` (415)
- `PAYLOAD_TOO_LARGE` (413)
- `UPLOAD_FAILED` (500)
