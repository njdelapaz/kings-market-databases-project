'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ItemRequestPage() {
    const router = useRouter();

    const [name,        setName]        = useState('');
    const [description, setDescription] = useState('');
    const [submitting,  setSubmitting]  = useState(false);
    const [submitted,   setSubmitted]   = useState(false);
    const [errorMsg,    setErrorMsg]    = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg('');
        setSubmitting(true);
        try {
            const res  = await fetch('/api/item-requests', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ name, description }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setErrorMsg(data.message || data.error || 'Failed to submit request.');
            }
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    function handleAnother() {
        setName('');
        setDescription('');
        setSubmitted(false);
        setErrorMsg('');
    }

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-12">
            <div className="max-w-xl mx-auto">

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-indigo-100 hover:text-white mb-8 transition-colors font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Request an Item</h1>
                <p className="text-indigo-200 mb-8 text-sm">Don&apos;t see something you need? Let us know and we&apos;ll look into stocking it.</p>

                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-400/20 overflow-hidden">

                    {submitted ? (
                        <div className="p-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
                            <p className="text-slate-500 text-sm mb-8">Thanks for the suggestion. Our team will review it.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleAnother}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    Submit Another
                                </button>
                                <button
                                    onClick={() => router.push('/customer')}
                                    className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Back to Shop
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                            {errorMsg && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                                    Item Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Organic Goat Milk"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                                    Reasoning <span className="text-slate-300">(optional)</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Why would you like this item stocked?"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting…' : 'Submit Request'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
