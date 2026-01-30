'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function TrackingPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const res = await fetch(`/api/tracking/${id}`);
                const json = await res.json();
                if (res.ok) setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTracking();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Blockchain Data...</div>;
    if (!data) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Tracking Not Found</div>;

    const isSimulated = data.history.some(h => h.isSimulated);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto p-8">
                <div className="mb-8">
                    <Link href="/dashboard/buyer" className="text-emerald-400 hover:text-emerald-300">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold mt-4">Supply Chain Tracking</h1>
                    <p className="text-slate-400">Listing ID: {id}</p>

                    {isSimulated && (
                        <div className="mt-4 bg-amber-900/20 border border-amber-500/30 rounded-lg p-3 text-sm">
                            <span className="text-amber-400">⚠️ Demo Mode:</span> Using MongoDB simulation (Blockchain not deployed)
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
                    <h2 className="text-xl font-bold mb-4">{data.listing.title}</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-400 block">Supplier</span>
                            {data.listing.supplier}
                        </div>
                        <div>
                            <span className="text-slate-400 block">Quantity</span>
                            {data.listing.quantity} kg
                        </div>
                        {data.listing.buyer && (
                            <div>
                                <span className="text-slate-400 block">Buyer</span>
                                {data.listing.buyer}
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative border-l-2 border-emerald-500/30 ml-4 space-y-8">
                    {data.history.map((step, index) => (
                        <div key={index} className="relative pl-8">
                            {/* Dot */}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-emerald-400">{step.state}</h3>
                                    <span className="text-xs text-slate-500">{step.timestamp}</span>
                                </div>

                                <div className="text-sm text-slate-400 font-mono break-all">
                                    {step.txHash && step.txHash.length > 20 ? (
                                        <div className="mt-2">
                                            <span className="block mb-1 text-slate-500">
                                                {step.isSimulated ? 'Simulated TX Hash:' : 'Blockchain Proof:'}
                                            </span>
                                            {step.isSimulated ? (
                                                <span className="text-slate-500">{step.txHash}</span>
                                            ) : (
                                                <a
                                                    href={`https://sepolia.etherscan.io/tx/${step.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline flex items-center gap-2"
                                                >
                                                    {step.txHash} ↗
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-600 italic">Pending...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
