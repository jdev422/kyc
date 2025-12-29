# KYC Backend API Guide (Node.js + MongoDB + Cloudinary)

This document defines the backend API contract needed for the KYC frontend, plus recommendations for persistence (MongoDB) and file storage (Cloudinary `kyc/` folder).

## Goals

- Persist all KYC form data in MongoDB.
- Upload/store all images/documents in Cloudinary under `kyc/`.
- Keep request/response shapes predictable and frontend-friendly.
- Validate inputs and file types (especially for compliance-sensitive uploads).

## Frontend Compatibility (current expectations)

The current frontend expects the backend to expose these public routes under the `/kyc` prefix:

- `POST /kyc/register` (JSON body) → returns `applicantId`
- `POST /kyc/selfie` (multipart) → uploads selfie
- `POST /kyc/id-docs` (multipart) → uploads **two** document types with **front+back**
- `POST /kyc/address` (multipart) → uploads proof of address (PDF/JPG/PNG) + metadata

Frontend base URL options:

- Direct calls: set `NEXT_PUBLIC_API_BASE_URL` (requires backend CORS)
- Same-origin proxy: set `KYC_API_BASE_URL` in Next.js and call `/kyc/...` (recommended for local dev)

## Standard Response Shape

Use a consistent envelope for all endpoints:

- Success: `{ "data": <payload>, "error": null }`
- Error: `{ "data": null, "error": { "code": string, "message": string, "details"?: any } }`

Suggested HTTP status codes:

- `400` invalid request / validation error
- `401/403` auth/permission error
- `404` missing applicant/resource
- `413` payload too large
- `415` unsupported media type
- `500` internal error

## Data Model (MongoDB) — Suggested

### Collection: `kyc_applicants`

Minimal document shape:

```json
{
  "_id": "ObjectId",
  "applicantId": "app_123",
  "status": "draft|in_progress|submitted|approved|rejected",
  "stepStatus": { "identity": true, "selfie": false, "idDocs": false, "address": false },
  "identity": {
    "firstName": "Jane",
    "middleName": "Marie",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "dob": "1990-01-01",
    "gender": "female"
  },
  "physicalAddress": {
    "street": "123 Market St",
    "city": "San Francisco",
    "region": "CA",
    "postalCode": "94105",
    "country": "US"
  },
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

Indexes:

- `{ applicantId: 1 }` unique
- `{ "identity.email": 1 }` (optional)
- `{ "identity.phone": 1 }` (optional)
- `{ status: 1 }`

### Collection: `kyc_files`

Store all Cloudinary metadata here.

```json
{
  "_id": "ObjectId",
  "applicantId": "app_123",
  "kind": "selfie|id_front|id_back|address_proof",
  "docGroup": 0,
  "docType": "Passport",
  "cloudinary": {
    "publicId": "kyc/app_123/id-docs/0/front/...",
    "secureUrl": "https://...",
    "resourceType": "image|raw",
    "bytes": 12345,
    "format": "jpg"
  },
  "createdAt": "ISO"
}
```

Indexes:

- `{ applicantId: 1, kind: 1 }`
- `{ applicantId: 1, docGroup: 1 }`

## Cloudinary Storage

Recommended folder layout:

- `kyc/<applicantId>/selfie/...`
- `kyc/<applicantId>/id-docs/0/front/...`
- `kyc/<applicantId>/id-docs/0/back/...`
- `kyc/<applicantId>/id-docs/1/front/...`
- `kyc/<applicantId>/id-docs/1/back/...`
- `kyc/<applicantId>/address-proof/...`

Recommended security:

- Use `access_mode: "authenticated"` (or private assets) and return signed URLs to admins only.
- Do not expose Cloudinary URLs publicly unless explicitly intended.

## Accepted File Types

- Selfie: `image/jpeg`, `image/png`
- ID docs: `image/jpeg`, `image/png` (frontend currently uses `accept="image/*"`)
- Proof of address: **PDF, JPG/JPEG, PNG only**
  - `application/pdf`, `image/jpeg`, `image/png`

## ID Document Types (dropdown)

Backend should accept/validate one of these strings:

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

Primary ID requirement:

- At least one of the two uploaded document types must be considered “primary” (passport / driver’s license / identification card).

## API Endpoints (backend)

### 1) Register applicant / Identity basics

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

Validation:

- Required: `firstName`, `lastName`, `email`, `phone`, `dob`, `gender`
- Required address: `addressStreet`, `addressCity`, `addressRegion`, `addressPostalCode`, `addressCountry`
- Email format, phone sanity, DOB not in future

Response:

```json
{ "data": { "applicantId": "app_..." }, "error": null }
```

### 2) Upload selfie

`POST /kyc/selfie`

Content-Type: `multipart/form-data`

Fields:

- `applicantId`: string
- `selfie`: file (JPG/PNG)

Server actions:

- Validate applicant exists
- Validate file type/size
- Upload to Cloudinary `kyc/<applicantId>/selfie`
- Save record in `kyc_files`
- Set `stepStatus.selfie = true`

Response:

```json
{ "data": { "status": "uploaded" }, "error": null }
```

### 3) Upload ID docs (two document types; each front + back)

`POST /kyc/id-docs`

Content-Type: `multipart/form-data`

Fields:

- `applicantId`: string
- `docType_0`: string
- `front_0`: file (JPG/PNG)
- `back_0`: file (JPG/PNG)
- `docType_1`: string
- `front_1`: file (JPG/PNG)
- `back_1`: file (JPG/PNG)

Validation:

- Both documents must have: `docType`, `front`, `back`
- At least one `docType_*` must be a “primary” type

Server actions:

- Upload all 4 files to Cloudinary under `kyc/<applicantId>/id-docs/...`
- Save 4 records in `kyc_files` (`kind=id_front/id_back`, `docGroup=0|1`, `docType`)
- Set `stepStatus.idDocs = true`

Response:

```json
{ "data": { "status": "uploaded" }, "error": null }
```

### 4) Upload proof of address

`POST /kyc/address`

Content-Type: `multipart/form-data`

Fields:

- `applicantId`: string
- `document`: file (**PDF/JPG/PNG only**)
- `docType`: string (e.g. `utility-bill`)
- `issuer`: string
- `country`: string (optional)
- `issueDate`: `YYYY-MM-DD`

Validation:

- `document` required, must be PDF/JPG/PNG
- `docType`, `issuer`, `issueDate` required

Server actions:

- Upload to Cloudinary `kyc/<applicantId>/address-proof`
  - If PDF, use `resource_type: "raw"`
- Save `kyc_files` record (`kind="address_proof"`)
- Store metadata (either in `kyc_applicants` or separate collection)
- Set `stepStatus.address = true`

Response:

```json
{ "data": { "status": "submitted" }, "error": null }
```

## Implementation Notes (Node.js)

- Upload middleware: `multer` with `memoryStorage()` to avoid writing to disk.
- Validate MIME type and extension, and enforce size limits.
- Cloudinary upload:
  - images: `resource_type: "image"`
  - pdf: `resource_type: "raw"`
  - use `upload_stream` for buffers
- Always store `public_id` and `secure_url` in MongoDB.

## Environment Variables

MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
