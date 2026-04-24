'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

type Item = {
    ItemID: number;
    SKU: string;
    Name: string;
    Quantity: number;
    Price: number | string;
    IsSelling: number | boolean;
    Category: string | null;
    stockStatus: StockStatus;
};

function StockBadge({ status, quantity }: { status: StockStatus; quantity: number }) {
    if (status === 'out_of_stock') {
        return (
            <span className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                Out of Stock
            </span>
        );
    }
    if (status === 'low_stock') {
        return (
            <span className="bg-amber-100 text-amber-700 text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                Low Stock &ndash; {quantity} left
            </span>
        );
    }
    return (
        <span className="bg-green-100 text-green-700 text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full">
            In Stock
        </span>
    );
}

function ItemDetailInner() {
    const routeParams  = useParams<{ id: string }>();
    const params       = useSearchParams();
    const router       = useRouter();

    const id    = routeParams?.id ?? '';
    const email = params.get('email') ?? '';
    const name  = params.get('name')  ?? '';

    const [item,      setItem]      = useState<Item | null>(null);
    const [loading,   setLoading]   = useState(true);
    const [errorMsg,  setErrorMsg]  = useState('');
    const [submitting,setSubmitting]= useState(false);
    const [successMsg,setSuccessMsg]= useState('');

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        async function load() {
            setLoading(true);
            setErrorMsg('');
            try {
                const res  = await fetch(`/api/items/${encodeURIComponent(id)}`);
                const data = await res.json();
                if (cancelled) return;
                if (res.ok && data.success) {
                    setItem(data.item);
                } else {
                    setErrorMsg(data.message || data.error || 'Item not found.');
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to fetch item:', err);
                    setErrorMsg('Failed to load item.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [id]);

    async function addToCart() {
        if (!item || item.stockStatus === 'out_of_stock') return;
        setSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            // Cart API appends one "Add" row per call. We issue exactly one
            // here — click again for more. Batching into a loop here collides
            // on UpdateCart's (email, item, timestamp) PK at same-second precision.
            const info = {
                itemID:        item.ItemID,
                CustomerEmail: email,
                action:        'Add',
                timestamp:     dayjs().format('YYYY-MM-DD HH:mm:ss'),
            };
            const res  = await fetch('/api/cart', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(info),
            });
            const data = await res.json();
            if (!data.success) {
                setErrorMsg(data.message || data.error || 'Failed to add to cart.');
                return;
            }
            setSuccessMsg(`Added ${item.Name} to cart.`);
            // Optimistic local update so the badge flips to low/out-of-stock promptly.
            setItem(prev => prev ? { ...prev, Quantity: Math.max(0, prev.Quantity - 1) } : prev);
        } catch (err) {
            console.error('Add to cart error:', err);
            setErrorMsg('Failed to add to cart.');
        } finally {
            setSubmitting(false);
        }
    }

    const backHref = `/customer?${new URLSearchParams({
        ...(name  ? { name }  : {}),
        ...(email ? { email } : {}),
    }).toString()}`;

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={backHref}
                        className="text-white/90 hover:text-white text-sm font-semibold"
                    >
                        ← Back to catalog
                    </Link>
                    {email && (
                        <Link
                            href={`/cart?email=${encodeURIComponent(email)}`}
                            className="text-white/90 hover:text-white text-sm font-semibold"
                        >
                            View cart →
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                    {loading && (
                        <p className="text-slate-400 text-center py-12">Loading item…</p>
                    )}

                    {!loading && errorMsg && !item && (
                        <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                            {errorMsg}
                        </div>
                    )}

                    {!loading && item && (
                        <>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">{item.Name}</h1>
                                    <p className="text-sm text-slate-500 mt-1">SKU: {item.SKU}</p>
                                    {item.Category && (
                                        <p className="text-sm text-slate-500 mt-1">Category: {item.Category}</p>
                                    )}
                                </div>
                                <StockBadge status={item.stockStatus} quantity={item.Quantity} />
                            </div>

                            <p className="text-4xl font-semibold text-blue-600 mt-6">
                                ${Number(item.Price).toFixed(2)}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {item.Quantity} in stock
                            </p>

                            <div className="mt-8 flex items-center gap-3">
                                <button
                                    onClick={addToCart}
                                    disabled={submitting || item.stockStatus === 'out_of_stock' || !email}
                                    className={`px-5 py-2 font-semibold rounded-lg transition ${
                                        item.stockStatus === 'out_of_stock' || !email
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {item.stockStatus === 'out_of_stock'
                                        ? 'Out of Stock'
                                        : submitting ? 'Adding…' : 'Add to Cart'}
                                </button>
                                <span className="text-xs text-slate-500">
                                    Click again to add more.
                                </span>
                            </div>

                            {!email && (
                                <p className="text-xs text-slate-500 mt-3">
                                    Log in as a customer to add items to a cart.
                                </p>
                            )}

                            {successMsg && (
                                <div className="mt-6 rounded-xl px-4 py-3 text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                                    {successMsg}
                                </div>
                            )}
                            {errorMsg && (
                                <div className="mt-6 rounded-xl px-4 py-3 text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                                    {errorMsg}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ItemDetailPage() {
    return (
        <Suspense>
            <ItemDetailInner />
        </Suspense>
    );
}
