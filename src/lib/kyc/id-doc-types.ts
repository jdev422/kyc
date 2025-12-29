export const ID_DOC_TYPES = [
  "Passport",
  "Driver’s License",
  "Foreign Driver’s License",
  "Foreign Passport",
  "BC Driver’s License and Services Card",
  "Photo BC Services Card",
  "Permanent Resident (PR) Card",
  "Citizenship Card",
  "Secure Certificated of Indian Status Card",
  "National Institute of The Blind(CNIB) Identification Card",
  "Federal, Provincial or Municipal Identification Card",
  "Military Family Card",
  "Firearms Acquisition Certificate (FAC) or PAL",
  "Provincial or Territorial Health Cards",
  "Government Employment Card",
  "International Student Card",
  "Age of Majority Card",
  "Birth Certificate",
  "Baptismal Certificate",
  "Non-Photo BC Services Card",
  "Hunting License",
  "Fishing License",
  "Boating License",
  "LCBO/Age of Majority Card",
  "Outdoors Card",
  "Hospital Card",
  "Blood Donor Card",
  "Immigration Papers",
  "Student ID",
  "City/Municipal Library Card",
] as const;

export type IdDocType = (typeof ID_DOC_TYPES)[number];

export const PRIMARY_ID_DOC_TYPES: ReadonlyArray<IdDocType> = [
  "Passport",
  "Driver’s License",
  "Foreign Driver’s License",
  "Foreign Passport",
  "BC Driver’s License and Services Card",
  "Photo BC Services Card",
  "Permanent Resident (PR) Card",
  "Citizenship Card",
  "Secure Certificated of Indian Status Card",
  "National Institute of The Blind(CNIB) Identification Card",
  "Federal, Provincial or Municipal Identification Card",
  "Military Family Card",
  "Firearms Acquisition Certificate (FAC) or PAL",
  "Provincial or Territorial Health Cards",
  "Government Employment Card",
  "International Student Card",
  "Age of Majority Card",
  "LCBO/Age of Majority Card",
  "Student ID",
];

export function isPrimaryIdentityDocType(docType: string) {
  const normalized = docType.trim();
  if (!normalized) return false;
  return (
    (PRIMARY_ID_DOC_TYPES as ReadonlyArray<string>).includes(normalized) ||
    normalized.toLowerCase().includes("passport") ||
    normalized.toLowerCase().includes("driver") ||
    normalized.toLowerCase().includes("identification card")
  );
}
