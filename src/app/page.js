import Link from 'next/link';
import Button from '../components/Button';
import styles from '../styles/auth.module.css';

export default function Home() {
  return (
    <div className={styles.authContainer}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.1 }}>
          Circular Economy Marketplace
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
          Connecting waste generators, recyclers, and manufacturers to build a sustainable future.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ width: '180px' }}>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
          <div style={{ width: '180px' }}>
            <Link href="/login">
              <Button variant="glass">Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
