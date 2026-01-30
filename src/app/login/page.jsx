"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../../components/Input';
import Button from '../../components/Button';
import styles from '../../styles/auth.module.css';

export default function Login() {
    const router = useRouter(); // Initialize router
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store user in localStorage (demo)
            localStorage.setItem('user', JSON.stringify(data.user));

            console.log("Login successful", data);
            router.push('/'); // Redirect to dashboard
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1 className={`${styles.authTitle} text-gradient`}>Welcome Back</h1>
                    <p className={styles.authSubtitle}>Access the circular economy marketplace</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            onChange={handleChange}
                            required
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <a href="#" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Forgot Password?</a>
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            {error && <p style={{ color: '#ff4d4d', fontSize: '0.9rem', textAlign: 'center', marginBottom: '0.5rem' }}>{error}</p>}
                            <Button type="submit" variant="primary">
                                {loading ? 'Logging in...' : 'Log In'}
                            </Button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        New to the platform?{' '}
                        <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                            Create Account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
