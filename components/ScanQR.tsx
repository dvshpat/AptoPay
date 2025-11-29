"use client";

import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScanQRProps {
  onQRScanned: (scannedData: { username: string; walletAddress: string }) => void;
  onCancel: () => void;
}

export default function ScanQR({ onQRScanned, onCancel }: ScanQRProps) {
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [permissionPopup, setPermissionPopup] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // 🧹 Cleanup when unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().catch(console.error);
      qrScannerRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const startCameraAndScan = async () => {
    setPermissionPopup(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsScanning(true);

      qrScannerRef.current = new Html5Qrcode("qr-scanner-area");
      qrScannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            try {
              const parsedData = JSON.parse(decodedText);

              if (parsedData.username && parsedData.walletAddress) {

                // ⛔ STOP CAMERA AFTER SCANNING (CRITICAL FIX)
                stopScanner();

                onQRScanned({
                  username: parsedData.username.replace("@", ""),
                  walletAddress: parsedData.walletAddress,
                });
              } else {
                setError("Invalid QR code format");
              }
            } catch {
              setError("Could not read QR data");
            }
          },
          () => {}
        )
        .catch((err) => setError("Failed to scan QR: " + err));
    } catch {
      setError("Camera permission denied!");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-lg max-w-md mx-auto">
      {/* Permission Popup */}
      {permissionPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white px-6 py-4 rounded-xl w-80 text-center shadow-lg">
            <p className="text-lg font-semibold mb-3">Allow Camera Access?</p>
            <p className="text-sm text-gray-600 mb-4">
              We need camera access to scan QR codes.
            </p>
            <button
              onClick={startCameraAndScan}
              className="w-full py-2 bg-green-500 text-white rounded-lg"
            >
              Allow
            </button>
          </div>
        </div>
      )}

      <h3 className="text-2xl font-bold text-emerald-900 mb-4">Scan QR Code</h3>

      {/* Mirrored Preview for Better Alignment */}
      <video
        ref={videoRef}
        className="w-full max-w-sm rounded-lg mb-4 transform scale-x-[-1]"
      />

      <div id="qr-scanner-area" className="w-full max-w-sm relative"></div>

      {isScanning && (
        <div className="absolute top-[45%] w-64 h-64 border-2 border-green-500 rounded-lg animate-pulse pointer-events-none"></div>
      )}

      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded-lg text-center w-full">
          {error}
        </p>
      )}

      <div className="flex gap-4 mt-6 w-full">
        <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 rounded-lg">
          Cancel
        </button>
        <button
          onClick={startCameraAndScan}
          className="flex-1 py-3 bg-emerald-600 text-white rounded-lg"
        >
          Restart Scanner
        </button>
      </div>
    </div>
  );
}
