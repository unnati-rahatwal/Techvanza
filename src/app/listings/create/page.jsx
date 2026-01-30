'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function CreateListing() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        wasteType: '',
        quantity: '',
        pricePerKg: '',
        location: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    // Camera related states
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Watch for camera open state and video ref to assign stream
    useEffect(() => {
        if (isCameraOpen && videoRef.current && streamRef.current) {
            console.log("Assigning stream to video element");
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
    }, [isCameraOpen]); // Re-run when camera opens

    const startCamera = async () => {
        try {
            setCameraError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            setIsCameraOpen(true); // Trigger render of video element
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError('Could not access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            console.log("Capturing photo. Video dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);

            if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                console.error("Video dimensions are 0. Camera might not be ready.");
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);

            canvas.toBlob(blob => {
                if (blob) {
                    console.log("Blob created:", blob.size, blob.type);
                    const file = new File([blob], "webcam_capture.png", { type: "image/png" });
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                    stopCamera();
                } else {
                    console.error("Failed to create blob from canvas");
                }
            }, 'image/png');
        } else {
            console.error("videoRef.current is null");
        }
    };

    const wasteOptions = [
        'Plastic (PET, HDPE)',
        'Paper & Cardboard',
        'Glass',
        'Metal (Scrap)',
        'E-Waste',
        'Textile Waste',
        'Organic/Bio'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // For now, just putting coords in the text field. 
                // Ideally this would be reverse geocoded or stored as discrete lat/lng in DB
                setFormData(prev => ({
                    ...prev,
                    location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                }));
                setLocationLoading(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert('Unable to retrieve location');
                setLocationLoading(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) throw new Error('You must be logged in');

            if (!image) throw new Error('Please capture a photo of the waste');

            const payload = new FormData();
            payload.append('supplier', user._id);
            Object.keys(formData).forEach(key => payload.append(key, formData[key]));
            if (image) payload.append('image', image);

            const res = await fetch('/api/listings', {
                method: 'POST',
                body: payload
            });

            if (!res.ok) throw new Error('Failed to create listing');

            router.push('/dashboard/seller');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.backButton}
                        aria-label="Go Back"
                    >
                        ←
                    </button>
                    <h1 className={styles.title}>Add New Listing</h1>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Camera Section */}
                    <div className={styles.cameraSection}>
                        <label>Product Image (Live Capture Only)</label>

                        {!isCameraOpen && !preview && (
                            <div className={styles.cameraPlaceholder} onClick={startCamera}>
                                <div className={styles.iconCamera}>📷</div>
                                <span>Tap to Open Camera</span>
                            </div>
                        )}

                        {isCameraOpen && (
                            <div className={styles.cameraContainer}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={() => videoRef.current && videoRef.current.play()}
                                    className={styles.videoPreview}
                                />
                                <div className={styles.cameraOverlay}>
                                    <button type="button" className={styles.cancelBtn} onClick={stopCamera}>
                                        Cancel
                                    </button>
                                    <button type="button" className={styles.captureBtn} onClick={capturePhoto} />
                                    <div style={{ width: '60px' }}></div>
                                </div>
                            </div>
                        )}

                        {preview && (
                            <div className={styles.previewContainer}>
                                <img src={preview} alt="Preview" className={styles.previewImage} />
                                <button
                                    type="button"
                                    className={styles.retakeBtn}
                                    onClick={() => {
                                        setPreview(null);
                                        setImage(null);
                                        startCamera();
                                    }}
                                >
                                    Retake Photo
                                </button>
                            </div>
                        )}

                        {cameraError && <p className={styles.error}>{cameraError}</p>}
                    </div>

                    <Input
                        label="Listing Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. 50kg Recycled Plastic Bottles"
                        required
                    />

                    <div className={styles.formGroup}>
                        <label>Waste Type</label>
                        <select
                            name="wasteType"
                            value={formData.wasteType}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Select Type</option>
                            {wasteOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.row}>
                        <Input
                            label="Quantity (kg)"
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="0"
                            required
                        />
                        <Input
                            label="Price per kg (₹)"
                            name="pricePerKg"
                            type="number"
                            value={formData.pricePerKg}
                            onChange={handleChange}
                            placeholder="0"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Describe the quality, condition, etc."
                            rows="4"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ marginBottom: 0 }}>Pickup Location</label>
                            <button
                                type="button"
                                onClick={getLocation}
                                disabled={locationLoading}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #38ef7d',
                                    color: '#38ef7d',
                                    borderRadius: '4px',
                                    padding: '0.2rem 0.6rem',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {locationLoading ? 'Locating...' : '📍 Use Live Location'}
                            </button>
                        </div>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter Address or use Live Location"
                            className={styles.input} // Assuming reusing input styles if possible, else manual style
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white'
                            }}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={loading}
                            className={styles.buttonCancel}
                        >
                            Cancel
                        </button>
                        <Button type="submit" disabled={loading || !image} style={{ flex: 1, padding: '0.85rem' }}>
                            {loading ? 'Posting...' : 'Create Listing'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
