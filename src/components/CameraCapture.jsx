'use client';

import { useState, useRef, useEffect } from "react";
import Button from './Button'; // Preserving my Button component
import { Camera, RefreshCw } from "lucide-react"; // Using lucide icons

export default function CameraCapture({ onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [cameraActive, setCameraActive] = useState(false);

    const startCamera = async () => {
        try {
            console.log("Requesting camera access...");
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 }, // Attempt HD
                    height: { ideal: 720 },
                },
            });
            console.log("Camera access granted");

            // Set stream state - let useEffect handle srcObject assignment
            setStream(mediaStream);
            setCameraActive(true);
            setError('');
        } catch (err) {
            console.error("Camera Error:", err);
            setError("Unable to access camera. Please allow permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Keep toDataURL for Cloudinary/Preview compatibility
                const imageData = canvas.toDataURL("image/jpeg", 0.8);
                setImage(imageData);
                onCapture(imageData);
                stopCamera();
            }
        }
    };

    const retakePhoto = () => {
        setImage(null);
        onCapture(null);
        startCamera();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Effect to toggle video visibility based on active state
    useEffect(() => {
        if (videoRef.current && stream) {
            // Only set if different to avoid interruption
            if (videoRef.current.srcObject !== stream) {
                videoRef.current.srcObject = stream;
            }
        }
    }, [stream]);


    return (
        <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '1rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', zIndex: 10 }}>{error}</p>}

            {!image ? (
                <>
                    {/* Video Element - Always rendered but hidden if not active */}
                    <div style={{
                        width: '100%',
                        height: '300px',
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: cameraActive ? 'block' : 'none'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                background: 'black'
                            }}
                        />
                        {/* Capture Button Overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10
                        }}>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); capturePhoto(); }}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '4px solid rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Start Camera Placeholder */}
                    {!cameraActive && (
                        <div
                            onClick={startCamera}
                            style={{
                                height: '250px',
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexDirection: 'column',
                                gap: '1rem',
                                border: '2px dashed rgba(255,255,255,0.2)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                background: 'rgba(56, 239, 125, 0.1)',
                                padding: '1.5rem',
                                borderRadius: '50%',
                                color: '#38ef7d'
                            }}>
                                <Camera size={40} />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Tap to Open Camera</span>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ width: '100%', position: 'relative' }}>
                    <img src={image} alt="Captured" style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                    <button
                        type="button"
                        onClick={retakePhoto}
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            background: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600'
                        }}
                    >
                        <RefreshCw size={16} /> Retake
                    </button>
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}
