"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera as IconCamera, Loader2 } from "lucide-react";

type Props = {
  applicantId: string | null;
  cameraChecked: boolean;
  cameraMessage: string;
  selfieFile: File | null;
  error: string | null;
  onSelfieChange: (file: File | null) => void;
};

type BoundingBox = {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

const VIDEO_WIDTH = 360;
const VIDEO_HEIGHT = 360;

export function SelfieStep({
  applicantId,
  cameraChecked,
  cameraMessage,
  selfieFile,
  error,
  onSelfieChange,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [facesDetected, setFacesDetected] = useState(0);
  const [detected, setDetected] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const fileLabel = useMemo(
    () =>
      selfieFile
        ? `${selfieFile.name} (${(selfieFile.size / 1024).toFixed(0)} KB)`
        : "No file",
    [selfieFile]
  );

  const stopCamera = useCallback(() => {
    const stream = (videoRef.current?.srcObject as MediaStream | null) ?? null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stopCamera, previewUrl]);

  const captureSelfie = useCallback(() => {
    if (!detected) {
      setCameraError("No face detected yet. Center your face and try again.");
      return;
    }
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) {
      setCameraError("Camera not ready. Please try again or upload ID.");
      return;
    }
    canvas.width = video.videoWidth || VIDEO_WIDTH;
    canvas.height = video.videoHeight || VIDEO_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Unable to capture image. Please try again.");
          return;
        }
        const file = new File([blob], `selfie-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onSelfieChange(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      },
      "image/jpeg",
      0.92
    );
  }, [detected, onSelfieChange, previewUrl]);

  const handleResults = useCallback((results: { detections?: Array<{ boundingBox: { xCenter: number; yCenter: number; width: number; height: number } }> }) => {
    const detections = results?.detections ?? [];
    setFacesDetected(detections.length);
    setDetected(detections.length > 0);

    setShowCamera(true);
    setLoadingModel(false);
    const boxes: BoundingBox[] = detections.map((d, index: number) => {
      const bbox = d.boundingBox;
      return {
        id: `face-${index}`,
        top: bbox.yCenter * 100 - (bbox.height * 100) / 2,
        left: bbox.xCenter * 100 - (bbox.width * 100) / 2,
        width: bbox.width * 100,
        height: bbox.height * 100,
      };
    });
    setBoundingBoxes(boxes);
  }, []);

  const startCamera = useCallback(() => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported. Please upload your ID instead.");
      return;
    }

    setCameraError(null);
    setLoadingModel(true);
    setBoundingBoxes([]);
    setFacesDetected(0);
    setDetected(false);

    const startWhenReady = async () => {
      if (!videoRef.current) {
        requestAnimationFrame(startWhenReady);
        return;
      }
      try {
        const [{ Camera }, { FaceDetection }] = await Promise.all([
          import("@mediapipe/camera_utils"),
          import("@mediapipe/face_detection"),
        ]);

        const faceDetector = new FaceDetection({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        });
        faceDetector.setOptions({ model: "short" });
        faceDetector.onResults(handleResults);

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!videoRef.current) return;
            await faceDetector.send({ image: videoRef.current });
          },
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
        });

        await camera.start();
      } catch (err) {
        console.error(err);
        setCameraError("Unable to start camera. Please upload your ID instead.");
      }
    };

    requestAnimationFrame(startWhenReady);
  }, [handleResults]);

  return (
    <div className="space-y-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Biometric check</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Use your webcam/mobile camera to capture a selfie. If the capture fails,
          upload both sides of your photo ID or a passport image.
        </p>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {!cameraChecked ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              Checking your camera...
            </span>
          ) : (
            cameraMessage
          )}
        </div>
        {applicantId && (
          <p className="text-xs text-[var(--text-muted)]">
            Applicant ID: {applicantId}
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
          <IconCamera className="h-4 w-4 text-white" />
          <span>Live selfie capture (mobile friendly)</span>
        </div>

        <div className="mt-4 space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-4">
          <button
            type="button"
            onClick={startCamera}
            className="w-full rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/60"
          >
            {loadingModel ? "Loading..." : showCamera ? "Camera on" : "Start camera"}
          </button>
          <div className={`space-y-4 ${showCamera ? "" : "hidden"}`}>
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-black/40 bg-black"
              style={{ height: VIDEO_HEIGHT }}
            >
              {boundingBoxes.map((box) => (
                <span
                  key={box.id}
                  className="pointer-events-none absolute rounded-lg border-2 border-emerald-300 shadow-[0_0_20px_rgba(49,212,141,0.3)]"
                  style={{
                    top: `${box.top}%`,
                    left: `${box.left}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                />
              ))}
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={captureSelfie}
                disabled={!detected}
                className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-[var(--text-muted)]"
              >
                Capture Selfie
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/50"
              >
                Close camera
              </button>
            </div>
            {!detected && (
              <p className="text-xs text-[var(--text-muted)]">
                Align your face in the frame to enable capture.
              </p>
            )}
          </div>

          {!showCamera && previewUrl && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-black/30 p-3 text-center text-sm">
              <p className="mb-2 text-[var(--text-muted)]">Latest capture</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Captured selfie preview"
                className="mx-auto h-40 w-auto rounded-2xl object-cover"
              />
            </div>
          )}

          <p className="text-xs text-[var(--text-muted)]">Current file: {fileLabel}</p>

          {cameraError && (
            <p className="text-sm text-red-400" role="alert">
              {cameraError}
            </p>
          )}
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <canvas ref={captureCanvasRef} className="hidden" />
    </div>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white">
      <span className="text-[var(--text-muted)]">{label}:</span> {value}
    </span>
  );
}
