import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      {/* Shared Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>
            Turn Waste into Wealth with the Circular Economy
          </h1>
          <p className={styles.heroDescription}>
            Connect with verified recyclers, track materials transparently, and find the best value for your waste. Join the revolution today.
          </p>
          <div className={styles.heroActions}>
            <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Get Started
            </Link>
            <Link href="#features" className="btn btn-outline" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className="container">
          <h2 className="section-title">Why Choose EcoLoop?</h2>
          <p className="section-subtitle">
            We bridge the gap between waste generators and recyclers with smart technology and transparency.
          </p>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🔄</div>
              <h3 className={styles.cardTitle}>Smart Matching</h3>
              <p className={styles.cardText}>
                Our algorithm connects you with the perfect buyer or supplier based on material type, location, and quality.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>📊</div>
              <h3 className={styles.cardTitle}>Fair Pricing</h3>
              <p className={styles.cardText}>
                Get real-time market rates for your materials. Transparent pricing ensures fair deals for everyone.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🔗</div>
              <h3 className={styles.cardTitle}>Digital Provenance</h3>
              <p className={styles.cardText}>
                Track the journey of your waste from collection to new life with our blockchain-inspired tracking system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className={styles.stepList} style={{ marginTop: '3rem' }}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Register</h3>
              <p>Sign up as a Supplier or Buyer.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>List & Match</h3>
              <p>Post materials or browse verified listings.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Transact</h3>
              <p>Secure deal and transparent logistics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Ready to Close the Loop?</h2>
          <p className={styles.ctaText}>Join thousands of businesses making a difference.</p>
          <Link href="/register">
            <button className={styles.ctaButton}>Join EcoLoop Now</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>&copy; {new Date().getFullYear()} EcoLoop. All rights reserved.</p>
      </footer>
    </main>
  );
}
