"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Shield, Lock } from "lucide-react";
import {
  ADDRESS_TEMPLATE,
  AddressMeta,
  IDENTITY_TEMPLATE,
  IdentityForm,
  StepId,
  steps,
} from "./types";
import { Stepper } from "./stepper";
import { IdentityStep } from "./identity-step";
import { SelfieStep } from "./selfie-step";
import { IdUploadStep, type IdDocumentDraft } from "./id-upload-step";
import { AddressStep } from "./address-step";
import { SuccessStep } from "./success-step";
import { ConfirmDialog } from "./confirm-dialog";
import { LoadingOverlay } from "./loading-overlay";
import { validateIdentity } from "./identity-validation";
import { isPrimaryIdentityDocType } from "@/lib/kyc/id-doc-types";

type ParsedAddress =
  | {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    issuer: string;
  }
  | null;

export function KycFlow() {
  const [currentStep, setCurrentStep] = useState<StepId>("identity");
  const [applicantId, setApplicantId] = useState<string | null>(null);

  const [identity, setIdentity] = useState<IdentityForm>(IDENTITY_TEMPLATE);
  const [identityError, setIdentityError] = useState<string | null>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idDocuments, setIdDocuments] = useState<
    [IdDocumentDraft, IdDocumentDraft]
  >([
    { docType: "", frontFile: null, backFile: null },
    { docType: "", frontFile: null, backFile: null },
  ]);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [idDocsError, setIdDocsError] = useState<string | null>(null);
  const [cameraChecked, setCameraChecked] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Checking camera access...");

  const [addressDoc, setAddressDoc] = useState<File | null>(null);
  const [addressMeta, setAddressMeta] = useState<AddressMeta>(ADDRESS_TEMPLATE);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const currentIndex = useMemo(
    () => steps.findIndex((step) => step.id === currentStep),
    [currentStep]
  );

  const identityFieldErrors = useMemo(
    () => validateIdentity(identity),
    [identity]
  );

  const identityValid = useMemo(
    () => Object.keys(identityFieldErrors).length === 0,
    [identityFieldErrors]
  );

  const selfieValid = useMemo(() => {
    return Boolean(selfieFile);
  }, [selfieFile]);

  const idDocsValid = useMemo(() => {
    const completed = idDocuments.filter(
      (doc) => doc.docType && doc.frontFile && doc.backFile
    );
    if (completed.length !== 2) return false;
    return completed.some((doc) => isPrimaryIdentityDocType(doc.docType));
  }, [idDocuments]);

  const addressValid = useMemo(
    () =>
      Boolean(
        addressDoc &&
        addressMeta.docType &&
        addressMeta.issuer &&
        addressMeta.issueDate
      ),
    [addressDoc, addressMeta]
  );

  useEffect(() => {
    if (currentStep !== "selfie") return;
    if (typeof window === "undefined" || !navigator?.mediaDevices) {
      setCameraChecked(true);
      setCameraMessage("Media devices are unavailable in this environment.");
      return;
    }

    setCameraChecked(false);
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const hasVideo = devices.some((device) => device.kind === "videoinput");
        setCameraMessage(
          hasVideo
            ? "Camera ready. Capture a live selfie or switch to ID upload."
            : "No camera detected. Please upload ID front/back or a passport."
        );
      })
      .catch(() =>
        setCameraMessage(
          "Unable to access the camera. Upload ID front/back or a passport."
        )
      )
      .finally(() => setCameraChecked(true));
  }, [currentStep]);

  const setFile = (setter: (file: File | null) => void) => (file: File | null) =>
    setter(file);

  const submitIdentity = useCallback(async () => {
    const errors = validateIdentity(identity);
    if (Object.keys(errors).length) {
      setIdentityError("Please complete the required identity fields.");
      return;
    }

    setIdentityError(null);
    setIsLoading(true);
    setLoadingMessage("Registering applicant...");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identity),
      });
      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload?.error?.message || "Unable to register applicant.");
      }

      setApplicantId(payload.data.applicantId);
      setCurrentStep("selfie");
    } catch (error) {
      setIdentityError(
        error instanceof Error ? error.message : "Unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [identity]);

  const submitSelfie = useCallback(async () => {
    if (!applicantId) {
      setSelfieError("Register the applicant first.");
      return;
    }

    if (!selfieValid) {
      setSelfieError("Provide a selfie or upload both sides of your ID/passport.");
      return;
    }

    setSelfieError(null);
    setIsLoading(true);
    setLoadingMessage("Uploading biometric evidence...");

    try {
      const body = new FormData();
      body.append("applicantId", applicantId);
      if (selfieFile) body.append("selfie", selfieFile);

      const response = await fetch("/api/selfie", { method: "POST", body });
      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload?.error?.message || "Selfie upload failed.");
      }

      setCurrentStep("id-docs");
    } catch (error) {
      setSelfieError(
        error instanceof Error ? error.message : "Unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [applicantId, selfieValid, selfieFile]);

  const submitIdDocs = useCallback(async () => {
    if (!applicantId) {
      setIdDocsError("Register the applicant first.");
      return;
    }
    if (!idDocsValid) {
      const completed = idDocuments.filter(
        (doc) => doc.docType && doc.frontFile && doc.backFile
      );
      if (completed.length < 2) {
        setIdDocsError(
          "Upload front and back images for both documents and select document types."
        );
      } else if (!completed.some((doc) => isPrimaryIdentityDocType(doc.docType))) {
        setIdDocsError(
          "At least one uploaded document must be a passport, driver’s license, or identification card."
        );
      } else {
        setIdDocsError(
          "Upload front and back images for both documents and select document types."
        );
      }
      return;
    }

    setIdDocsError(null);
    setIsLoading(true);
    setLoadingMessage("Uploading ID documents...");

    try {
      const body = new FormData();
      body.append("applicantId", applicantId);
      idDocuments.forEach((doc, index) => {
        body.append(`docType_${index}`, doc.docType);
        if (doc.frontFile) body.append(`front_${index}`, doc.frontFile);
        if (doc.backFile) body.append(`back_${index}`, doc.backFile);
      });

      const response = await fetch("/api/id-docs", { method: "POST", body });
      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload?.error?.message || "ID upload failed.");
      }

      setCurrentStep("address");
    } catch (error) {
      setIdDocsError(error instanceof Error ? error.message : "Unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [applicantId, idDocsValid, idDocuments]);

  const submitAddress = useCallback(async () => {
    if (!applicantId) {
      setAddressError("Register the applicant first.");
      return;
    }
    if (!addressValid || !addressDoc) {
      setAddressError("Upload a document and complete the form.");
      return;
    }

    setConfirmOpen(false);
    setAddressError(null);
    setIsLoading(true);
    setLoadingMessage("Uploading proof of address...");

    try {
      const body = new FormData();
      body.append("applicantId", applicantId);
      body.append("document", addressDoc);
      body.append("docType", addressMeta.docType);
      body.append("issuer", addressMeta.issuer);
      body.append("country", addressMeta.country);
      body.append("issueDate", addressMeta.issueDate);

      const response = await fetch("/api/address", { method: "POST", body });
      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(
          payload?.error?.message || "Proof-of-address upload failed."
        );
      }

      setParsedAddress({
        ...payload.data.parsedAddress,
        issuer: payload.data.issuer,
      });
      setCurrentStep("success");
      setConfirmOpen(false);
    } catch (error) {
      setAddressError(
        error instanceof Error ? error.message : "Unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [addressValid, addressDoc, addressMeta, applicantId]);

  const handleNext = () => {
    if (currentStep === "identity") {
      submitIdentity();
    } else if (currentStep === "selfie") {
      submitSelfie();
    } else if (currentStep === "id-docs") {
      submitIdDocs();
    } else if (currentStep === "address") {
      setConfirmOpen(true);
    }
  };

  const handleBack = () => {
    if (currentStep === "identity") return;
    const prev = steps[currentIndex - 1]?.id;
    if (prev) setCurrentStep(prev);
  };

  const nextDisabled =
    currentStep === "identity"
      ? !identityValid
      : currentStep === "selfie"
        ? !selfieValid
        : currentStep === "id-docs"
          ? !idDocsValid
          : currentStep === "address"
            ? !addressValid
            : true;

  const resetFlow = () => {
    setCurrentStep("identity");
    setApplicantId(null);
    setIdentity(IDENTITY_TEMPLATE);
    setIdentityError(null);
    setSelfieFile(null);
    setIdDocuments([
      { docType: "", frontFile: null, backFile: null },
      { docType: "", frontFile: null, backFile: null },
    ]);
    setSelfieError(null);
    setIdDocsError(null);
    setAddressDoc(null);
    setAddressMeta(ADDRESS_TEMPLATE);
    setAddressError(null);
    setParsedAddress(null);
    setConfirmOpen(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-body)] px-4 py-10 text-[var(--text-primary)]">
      <div className="relative flex w-full max-w-4xl flex-col gap-6 rounded-[32px] border border-[var(--border-subtle)] bg-[var(--surface-card)]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <header className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
              <Lock className="h-4 w-4 text-white" aria-hidden />
              Webstacks KYC
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Identity Verification
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
            <Shield className="h-5 w-5 text-white" aria-hidden />
            Session secured via magic link
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <Stepper currentStep={currentStep} />
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--text-muted)]">
              <p className="font-medium text-white">Why we need this</p>
              <p className="mt-2">
                These checks meet AML/KYC regulations and help us keep your
                account secure. You can exit anytime and resume with your magic
                link.
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            {currentStep === "identity" && (
              <IdentityStep
                value={identity}
                error={identityError}
                fieldErrors={identityFieldErrors}
                onChange={setIdentity}
              />
            )}
            {currentStep === "selfie" && (
              <SelfieStep
                applicantId={applicantId}
                cameraChecked={cameraChecked}
                cameraMessage={cameraMessage}
                selfieFile={selfieFile}
                error={selfieError}
                onSelfieChange={setFile(setSelfieFile)}
              />
            )}
            {currentStep === "id-docs" && (
              <IdUploadStep
                documents={idDocuments}
                error={idDocsError}
                onChange={setIdDocuments}
              />
            )}
            {currentStep === "address" && (
              <AddressStep
                file={addressDoc}
                metadata={addressMeta}
                error={addressError}
                onFileChange={setFile(setAddressDoc)}
                onMetaChange={setAddressMeta}
              />
            )}
            {currentStep === "success" && (
              <SuccessStep
                applicantId={applicantId}
                parsedAddress={parsedAddress}
                onRestart={resetFlow}
              />
            )}
          </div>
        </section>

        {currentStep !== "success" && (
          <nav className="border-t border-[var(--border-subtle)] pt-4">
            <div className="flex flex-col gap-3 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
              <div>
                Step {currentIndex + 1} of {steps.length - 1}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  disabled={currentStep === "identity" || isLoading}
                  className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-transparent disabled:text-[var(--text-muted)]"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={nextDisabled || isLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-[var(--text-muted)]"
                >
                  {currentStep === "address" ? "Submit" : "Next"}
                </button>
              </div>
            </div>
          </nav>
        )}

        {isLoading && <LoadingOverlay message={loadingMessage} />}

        {confirmOpen && (
          <ConfirmDialog
            identity={identity}
            addressMeta={addressMeta}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={submitAddress}
          />
        )}
      </div>
    </div>
  );
}
