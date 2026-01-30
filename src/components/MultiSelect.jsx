"use client";
import { useState, useRef, useEffect } from "react";
import styles from "../styles/auth.module.css";

const WASTE_TYPES = [
    "Plastic (PET)",
    "Plastic (HDPE)",
    "Paper/Cardboard",
    "Metal (Ferrous)",
    "Metal (Non-Ferrous)",
    "Glass",
    "E-Waste",
    "Textile",
    "Organic/Biomass",
    "Rubber/Tyres",
];

export default function MultiSelect({
    label,
    selected = [],
    onChange,
    placeholder = "Select waste types...",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSelection = (type) => {
        const newSelection = selected.includes(type)
            ? selected.filter((item) => item !== type)
            : [...selected, type];
        onChange(newSelection);
    };

    return (
        <div className={styles.formGroup} ref={dropdownRef}>
            <label className={styles.label}>{label}</label>
            <div
                className="relative"
                style={{ position: "relative" }}
            >
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "12px",
                        borderRadius: "12px",
                        color: selected.length ? "white" : "rgba(255,255,255,0.4)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        maxWidth: '90%'
                    }}>
                        {selected.length > 0 ? selected.join(", ") : placeholder}
                    </span>
                    <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }}>
                        ▼
                    </span>
                </div>

                {isOpen && (
                    <div
                        style={{
                            position: "absolute",
                            top: "110%",
                            left: 0,
                            right: 0,
                            background: "#1a1a1a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            padding: "8px",
                            zIndex: 50,
                            maxHeight: "200px",
                            overflowY: "auto",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        }}
                    >
                        {WASTE_TYPES.map((type) => (
                            <div
                                key={type}
                                onClick={() => toggleSelection(type)}
                                style={{
                                    padding: "10px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    color: "white",
                                    background: selected.includes(type)
                                        ? "rgba(0, 255, 191, 0.1)"
                                        : "transparent",
                                    marginBottom: "2px"
                                }}
                                onMouseOver={(e) => {
                                    if (!selected.includes(type)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                }}
                                onMouseOut={(e) => {
                                    if (!selected.includes(type)) e.currentTarget.style.background = 'transparent'
                                }}
                            >
                                <div
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        border: "1px solid rgba(255,255,255,0.4)",
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: selected.includes(type) ? "var(--primary)" : "transparent",
                                        borderColor: selected.includes(type) ? "var(--primary)" : "rgba(255,255,255,0.4)"
                                    }}
                                >
                                    {selected.includes(type) && (
                                        <span style={{ color: "black", fontSize: "10px" }}>✓</span>
                                    )}
                                </div>
                                {type}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
