"use client";
import styles from '../styles/auth.module.css';

export default function Button({ children, variant = 'primary', ...props }) {
    const baseStyle = {
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
    };

    const variants = {
        primary: {
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            color: '#000',
            boxShadow: '0 4px 15px rgba(0, 255, 191, 0.2)',
        },
        outline: {
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
        },
        glass: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
        }
    };

    return (
        <button
            style={{ ...baseStyle, ...variants[variant] }}
            {...props}
            onMouseOver={(e) => {
                if (variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
                if (variant === 'primary') e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {children}
        </button>
    );
}
