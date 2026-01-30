'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <nav style={{
            background: 'rgba(15, 23, 42, 0.8)', // Darker translucent bg
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            color: 'white'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
                <Link href="/" style={{
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    EcoTrade
                </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {user ? (
                    <>
                        <Link href={`/dashboard/${user.role}`} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem', transition: 'color 0.2s' }} className="nav-link">
                            Dashboard
                        </Link>

                        {user.role === 'supplier' ? (
                            <Link href="/listings/create" style={{ color: '#38ef7d', textDecoration: 'none', fontWeight: '600' }}>
                                + Add Listing
                            </Link>
                        ) : (
                            <Link href="/marketplace" style={{ color: '#38ef7d', textDecoration: 'none', fontWeight: '600' }}>
                                Marketplace
                            </Link>
                        )}

                        {/* Profile Dropdown */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    boxShadow: '0 0 15px rgba(56, 239, 125, 0.3)',
                                    color: 'white',
                                    border: '2px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>

                            {isOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '120%',
                                    right: 0,
                                    background: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    minWidth: '180px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.2rem',
                                    zIndex: 101
                                }}>
                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user.role}</div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            textAlign: 'left',
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="/login" style={{
                            padding: '0.6rem 1.25rem',
                            color: '#94a3b8',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'color 0.2s'
                        }}
                            onMouseOver={(e) => e.target.style.color = 'white'}
                            onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                        >
                            Log In
                        </Link>
                        <Link href="/register" style={{
                            padding: '0.6rem 1.5rem',
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: '600',
                            borderRadius: '8px',
                            boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                            transition: 'transform 0.2s'
                        }}>
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav >
    );
}
