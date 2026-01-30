'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AIAgent.module.css';

export default function AIAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! I\'m your Eco-Assistant. Looking for something specific? Try saying "Find cheap plastic in Mumbai".' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSpeech = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice search is not supported in this browser. Please use Chrome.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        recognition.start();
    };

    const handleSend = async (textOverride) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { type: 'user', text }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/agent/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: `I found ${data.results.length} listings that match your needs!`,
                    results: data.results
                }]);
            } else {
                setMessages(prev => [...prev, { type: 'bot', text: 'I couldn\'t find any precise matches. Try a broader search?' }]);
            }

        } catch (error) {
            console.error('Agent Error:', error);
            setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I\'m having trouble connecting to the eco-network right now.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                className={`${styles.fab} ${isOpen ? styles.hidden : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <div className={styles.iconGlow}></div>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
            </button>

            {/* Chat Interface */}
            <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <span style={{ fontSize: '1.2rem' }}>🤖</span> Eco-Agent
                    </div>
                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
                </div>

                <div className={styles.messages}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`${styles.message} ${styles[msg.type]}`}>
                            {msg.text}
                            {msg.results && (
                                <div className={styles.resultsGrid}>
                                    {msg.results.slice(0, 3).map(item => (
                                        <div
                                            key={item._id}
                                            className={styles.miniCard}
                                            onClick={() => router.push(`/listings/${item._id}`)}
                                        >
                                            <div className={styles.miniImage}>
                                                {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
                                            </div>
                                            <div className={styles.miniInfo}>
                                                <p className={styles.miniTitle}>{item.title}</p>
                                                <p className={styles.miniPrice}>₹{item.pricePerKg}/kg</p>
                                            </div>
                                        </div>
                                    ))}
                                    {msg.results.length > 3 && (
                                        <button
                                            className={styles.seeMoreBtn}
                                            onClick={() => router.push('/marketplace')}
                                        >
                                            See All (+{msg.results.length - 3})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && <div className={`${styles.message} ${styles.bot}`}>Thinking... <span className={styles.dotPulse}>●</span></div>}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputArea}>
                    <button
                        className={`${styles.micBtn} ${isListening ? styles.listening : ''}`}
                        onClick={handleSpeech}
                    >
                        🎤
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type or speak..."
                        className={styles.input}
                    />
                    <button className={styles.sendBtn} onClick={() => handleSend()}>
                        ➤
                    </button>
                </div>
            </div>
        </>
    );
}
