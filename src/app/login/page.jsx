'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (searchParams.get('registered')) {
            setSuccess('Registration successful! Please log in.');
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Login failed');
            }

            const data = await res.json();
            // Store user in localStorage for demo purposes
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to role-based dashboard
            if (data.user.role === 'supplier') {
                router.push('/dashboard/supplier');
            } else if (data.user.role === 'buyer') {
                router.push('/dashboard/buyer');
            } else {
                router.push('/'); // Fallback
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Access the circular economy marketplace</p>

                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className={styles.input}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className={styles.input}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className={styles.registerLink}>
                    Don&apos;t have an account? <Link href="/register" className={styles.link}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
