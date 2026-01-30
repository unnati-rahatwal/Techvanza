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
        router.push('/login');
    };

    if (!user) return null; // Don't show navbar if not logged in

    return (
        <nav style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            color: 'white'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
                    EcoTrade
                </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href={`/dashboard/${user.role}`} style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                    Dashboard
                </Link>

                {user.role === 'supplier' && (
                    <Link
                        href="/supplier/requirements"
                        style={{
                            color: '#38ef7d',
                            textDecoration: 'none',
                            fontWeight: '600',
                            border: '1px solid rgba(56, 239, 125, 0.5)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: 'rgba(56, 239, 125, 0.1)',
                            marginLeft: '1rem'
                        }}
                    >
                        + Add Requirement
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
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}
                    >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    {isOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            minWidth: '150px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem'
                        }}>
                            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{user.role}</div>
                            </div>

                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ff6b6b',
                                    textAlign: 'left',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = 'rgba(255, 107, 107, 0.1)'}
                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
