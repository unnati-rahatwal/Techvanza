"use client";
import styles from '../styles/auth.module.css';

export default function Input({ label, type = 'text', ...props }) {
    return (
        <div className={styles.formGroup}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                type={type}
                className="width-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-all duration-300 w-full"
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '12px',
                    borderRadius: '12px',
                    width: '100%',
                    color: 'white',
                    outline: 'none',
                    fontSize: '1rem'
                }}
                {...props}
            />
        </div>
    );
}
