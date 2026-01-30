'use client';

import { useState } from 'react';
import Button from './Button';

export default function LocationCapture({ onLocationSelect }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getCurrentLocation = () => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const locationData = { lat: latitude, lng: longitude };
                setLocation(locationData);
                onLocationSelect(locationData);
                setLoading(false);
            },
            (err) => {
                setError('Unable to retrieve your location');
                setLoading(false);
                console.error(err);
            }
        );
    };

    return (
        <div style={{ width: '100%' }}>
            {!location ? (
                <Button
                    type="button"
                    onClick={getCurrentLocation}
                    variant="glass"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    {loading ? 'Fetching...' : '📍 Use Current Location'}
                </Button>
            ) : (
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Coordinates</div>
                        <div style={{ fontWeight: 'bold' }}>
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </div>
                    </div>
                    <button
                        onClick={getCurrentLocation}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#38ef7d',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                        }}
                        title="Refresh Location"
                    >
                        ↻
                    </button>
                </div>
            )}
            {error && <p style={{ color: '#ff6b6b', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</p>}
        </div>
    );
}
