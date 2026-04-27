'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
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

type Category = { name: string; itemCount: number };

type SortKey = 'name' | 'price' | 'quantity';
type SortOrder = 'asc' | 'desc';

const SORT_OPTIONS: { value: `${SortKey}:${SortOrder}`; label: string }[] = [
    { value: 'name:asc',      label: 'Name (A-Z)' },
    { value: 'name:desc',     label: 'Name (Z-A)' },
    { value: 'price:asc',     label: 'Price (Low to High)' },
    { value: 'price:desc',    label: 'Price (High to Low)' },
    { value: 'quantity:desc', label: 'Stock (Most first)' },
    { value: 'quantity:asc',  label: 'Stock (Least first)' },
];

const DEFAULT_PAGE_SIZE = 12;

function StockBadge({ status, quantity }: { status: StockStatus; quantity: number }) {
    if (status === 'out_of_stock') {
        return (
            <span className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                Out of Stock
            </span>
        );
    }
    if (status === 'low_stock') {
        return (
            <span className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                Low Stock &ndash; {quantity} left
            </span>
        );
    }
    return (
        <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
            In Stock
        </span>
    );
}

function DashboardInner() {
    const params     = useSearchParams();
    const router     = useRouter();
    const pathname   = usePathname();
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    // URL-driven filter state. We read from search params so /customer?q=rice&...
    // is shareable and refresh-safe, then push updates back to the URL whenever
    // the user changes a control.
    const urlQ        = params.get('q') ?? '';
    const urlCategory = params.get('category') ?? '';
    const urlMin      = params.get('minPrice') ?? '';
    const urlMax      = params.get('maxPrice') ?? '';
    const urlSort     = (params.get('sort') ?? 'name') as SortKey;
    const urlOrder    = (params.get('order') ?? 'asc') as SortOrder;
    const urlPage     = Math.max(1, Number(params.get('page')) || 1);
    const urlPageSize = Math.max(1, Number(params.get('pageSize')) || DEFAULT_PAGE_SIZE);

    // Local "draft" state for the filter bar — only committed to the URL on
    // submit. Keeps typing in the search box from triggering a request per key.
    const [searchDraft, setSearchDraft] = useState(urlQ);
    const [minDraft,    setMinDraft]    = useState(urlMin);
    const [maxDraft,    setMaxDraft]    = useState(urlMax);

    const [items,        setItems]        = useState<Item[]>([]);
    const [cartQtyByItem, setCartQtyByItem] = useState<Record<number, number>>({});
    const [total,        setTotal]        = useState(0);
    const [categories,   setCategories]   = useState<Category[]>([]);
    const [loading,      setLoading]      = useState(false);
    const [errorMsg,     setErrorMsg]     = useState('');
    const [alert,        setAlert]        = useState({ show: false, itemName: '' });

    const [username, setUsername] = useState('');

    const totalPages = Math.max(1, Math.ceil(total / urlPageSize));

    const getEffectiveQty = useCallback(
        (item: Item) => Math.max(0, item.Quantity - (cartQtyByItem[item.ItemID] ?? 0)),
        [cartQtyByItem]
    );

    const getEffectiveStockStatus = useCallback(
        (item: Item): StockStatus => {
            const effectiveQty = getEffectiveQty(item);
            if (effectiveQty <= 0) return 'out_of_stock';
            if (effectiveQty <= 5) return 'low_stock';
            return 'in_stock';
        },
        [getEffectiveQty]
    );

    const refreshCartQuantities = useCallback(async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            if (!data.success) return;

            const nextMap = (data.cart ?? []).reduce((acc: Record<number, number>, row: { ItemID: number; TotalQuantity: number }) => {
                acc[row.ItemID] = Number(row.TotalQuantity) || 0;
                return acc;
            }, {});
            setCartQtyByItem(nextMap);
        } catch (err) {
            console.error('Failed to refresh cart quantities:', err);
        }
    }, []);

    // Build the next URL while preserving filter/sort/page params.
    const buildUrl = useCallback(
        (overrides: Record<string, string | number | null | undefined>) => {
            const next = new URLSearchParams(params.toString());
            for (const [k, v] of Object.entries(overrides)) {
                if (v === null || v === undefined || v === '') {
                    next.delete(k);
                } else {
                    next.set(k, String(v));
                }
            }
            return `${pathname}?${next.toString()}`;
        },
        [params, pathname]
    );

    const updateParams = useCallback(
        (overrides: Record<string, string | number | null | undefined>) => {
            router.push(buildUrl(overrides));
        },
        [router, buildUrl]
    );

    // Re-sync drafts whenever the URL changes (e.g. browser back/forward).
    useEffect(() => {
        setSearchDraft(urlQ);
        setMinDraft(urlMin);
        setMaxDraft(urlMax);
    }, [urlQ, urlMin, urlMax]);

    // Debounce the search box — commit to the URL ~350ms after the user
    // stops typing so every keystroke doesn't trigger a request.
    useEffect(() => {
        const next = searchDraft.trim();
        if (next === urlQ) return;
        const t = setTimeout(() => {
            updateParams({ q: next || null, page: 1 });
        }, 350);
        return () => clearTimeout(t);
    }, [searchDraft, urlQ, updateParams]);

    // Fetch catalog whenever any URL-level filter changes.
    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setErrorMsg('');
            try {
                const qs = new URLSearchParams();
                if (urlQ)        qs.set('q', urlQ);
                if (urlCategory) qs.set('category', urlCategory);
                if (urlMin)      qs.set('minPrice', urlMin);
                if (urlMax)      qs.set('maxPrice', urlMax);
                qs.set('sort',     urlSort);
                qs.set('order',    urlOrder);
                qs.set('page',     String(urlPage));
                qs.set('pageSize', String(urlPageSize));

                const res  = await fetch(`/api/items?${qs.toString()}`);
                const data = await res.json();
                if (cancelled) return;

                if (data.success) {
                    setItems(data.items ?? []);
                    setTotal(Number(data.total) || 0);
                } else {
                    setErrorMsg(data.message || data.error || 'Failed to load items.');
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to fetch items:', err);
                    setErrorMsg('Failed to fetch items.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [urlQ, urlCategory, urlMin, urlMax, urlSort, urlOrder, urlPage, urlPageSize]);

    // Categories fetched once per mount — the filter dropdown doesn't change
    // often enough to re-query on every filter change.
    useEffect(() => {
        let cancelled = false;
        async function loadCats() {
            try {
                const res  = await fetch('/api/categories');
                const data = await res.json();
                if (!cancelled && data.success) {
                    setCategories(data.categories ?? []);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        }
        loadCats();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        fetch('/api/profile')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.success) setUsername(data.profile.Username); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        refreshCartQuantities();
    }, [refreshCartQuantities]);

    useEffect(() => {
        if(localStorage.getItem('checkoutSuccess') === 'true'){
            setCheckoutSuccess(true);
            localStorage.removeItem('checkoutSuccess');
            setTimeout(() => setCheckoutSuccess(false), 3000)
        }
    }, [])

    async function handleCart(item: Item) {
        if (item.stockStatus === 'out_of_stock') return;
        try {
            // Stock is decremented at checkout (owned by Shrikar), so Add to Cart
            // only appends to the cart log here — no POST /api/items call.
            const info = {
                itemID:    item.ItemID,
                action:    'Add',
                timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            };
            const res  = await fetch('/api/cart', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(info),
            });
            const data = await res.json();
            if (data.success) {
                setCartQtyByItem(prev => ({
                    ...prev,
                    [item.ItemID]: (prev[item.ItemID] ?? 0) + 1,
                }));
                setAlert({ show: true, itemName: item.Name });
                setTimeout(() => setAlert({ show: false, itemName: '' }), 3000);
            }
        } catch (err) {
            console.error('Cart error: ', err);
        }
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const viewCart       = () => router.push('/cart');
    const viewPastOrders = () => router.push('/orderView');

    const sortValue = `${urlSort}:${urlOrder}`;

    // Fallback for pressing Enter in any filter input — commits whatever is
    // in the drafts immediately (bypassing the debounce timer).
    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams({
            q:        searchDraft.trim() || null,
            minPrice: minDraft.trim()    || null,
            maxPrice: maxDraft.trim()    || null,
            page:     1,
        });
    };

    const commitMinPrice = () => {
        const next = minDraft.trim();
        if (next !== urlMin) updateParams({ minPrice: next || null, page: 1 });
    };
    const commitMaxPrice = () => {
        const next = maxDraft.trim();
        if (next !== urlMax) updateParams({ maxPrice: next || null, page: 1 });
    };

    const onCategoryChange = (value: string) => {
        updateParams({ category: value || null, page: 1 });
    };

    const onSortChange = (value: string) => {
        const [sort, order] = value.split(':') as [SortKey, SortOrder];
        updateParams({ sort, order, page: 1 });
    };

    const onClearFilters = () => {
        setSearchDraft(''); setMinDraft(''); setMaxDraft('');
        updateParams({
            q: null, category: null, minPrice: null, maxPrice: null,
            sort: null, order: null, page: null,
        });
    };

    const goToPage = (p: number) => {
        const clamped = Math.min(Math.max(1, p), totalPages);
        if (clamped !== urlPage) updateParams({ page: clamped });
    };

    const pageWindow = useMemo(() => {
        // Show up to 5 pages centered around the current one.
        const window: number[] = [];
        const start = Math.max(1, urlPage - 2);
        const end   = Math.min(totalPages, start + 4);
        for (let p = start; p <= end; p++) window.push(p);
        return window;
    }, [urlPage, totalPages]);

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
            
            {alert.show && (
                <div className="fixed top-5 right-5 z-50 animate-fade-in-down">
                    <div className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 border border-blue-200 shadow-lg" role="alert">
                        <svg className="w-4 h-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <div className="ms-2 text-sm font-medium">{alert.itemName} added successfully!</div>
                        <button
                            onClick={() => setAlert({ show: false, itemName: '' })}
                            className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-100 inline-flex items-center justify-center h-8 w-8"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {checkoutSuccess && (
                    <div className='bg-green-50 border border-green-200 text-green-700 font-normal px-6 py-4 rounded-2xl mb-6 flex items-center justify-between'>
                        Order placed successfully!
                        <button
                            onClick={() => setCheckoutSuccess(false)}
                            className="bg-green-50 text-green-700 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-100 inline-flex items-center justify-center h-8 w-8"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                        </button>
                    </div>
                )}
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 mb-6 flex justify-between">
                    <h1 className="mt-2 p-3 text-slate-600">
                        Hey <span className="font-semibold text-blue-600">{username || '...'}</span>!
                    </h1>
                    <div className="flex justify-between gap-1">
                        <button onClick={viewCart} className="mt-2 p-3 font-semibold text-indigo-600 hover:text-black hover:bg-slate-50 rounded-2xl cursor-pointer">
                            Cart
                        </button>
                        <button onClick={viewPastOrders} className="mt-2 p-3 font-semibold text-indigo-600 hover:text-black hover:bg-slate-50 rounded-2xl cursor-pointer">
                            Past Orders
                        </button>
                        <button onClick={() => router.push('/profile')} className="mt-2 p-3 font-semibold text-indigo-600 hover:text-black hover:bg-slate-50 rounded-2xl cursor-pointer">
                            Profile
                        </button>
                        <button onClick={() => router.push('/itemRequest')} className="mt-2 p-3 font-semibold text-indigo-600 hover:text-black hover:bg-slate-50 rounded-2xl cursor-pointer">
                            Item Requests
                        </button>
                        <button
                            onClick={logout}
                            className="mt-2 p-2 text-sm font-semibold border-transparent text-slate-600 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filter bar — every control commits on its own:
                     - search: debounced (see effect above)
                     - category / sort: on change
                     - price min/max: on blur, plus Enter anywhere submits the form. */}
                <form onSubmit={onSearchSubmit} className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <input
                        type="text"
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        placeholder="Search items..."
                        className="md:col-span-5 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900 placeholder-slate-400"
                    />
                    <select
                        value={urlCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="md:col-span-3 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900"
                    >
                        <option value="">All categories</option>
                        {categories.map(c => (
                            <option key={c.name} value={c.name}>
                                {c.name} ({c.itemCount})
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={minDraft}
                        onChange={(e) => setMinDraft(e.target.value)}
                        onBlur={commitMinPrice}
                        placeholder="Min price"
                        className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900 placeholder-slate-400"
                    />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={maxDraft}
                        onChange={(e) => setMaxDraft(e.target.value)}
                        onBlur={commitMaxPrice}
                        placeholder="Max price"
                        className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900 placeholder-slate-400"
                    />
                    <select
                        value={sortValue}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="md:col-span-4 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <div className="md:col-span-8 flex items-center justify-between text-sm text-slate-500">
                        <span>
                            {loading ? 'Loading…' : `${total} item${total === 1 ? '' : 's'} found`}
                        </span>
                        <button
                            type="button"
                            onClick={onClearFilters}
                            className="px-3 py-1 text-slate-600 hover:text-slate-900"
                        >
                            Clear filters
                        </button>
                    </div>
                </form>

                {errorMsg && (
                    <div className="mb-6 rounded-xl px-4 py-3 text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                        {errorMsg}
                    </div>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => {
                        const effectiveQty = getEffectiveQty(item);
                        const effectiveStatus = getEffectiveStockStatus(item);
                        const isOut = effectiveStatus === 'out_of_stock';
                        return (
                            <div
                                key={item.ItemID}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                            >
                                <div className="p-5 flex-grow">
                                    <div className="flex justify-between items-start mb-2 gap-3">
                                        <Link
                                            href={`/items/${item.ItemID}`}
                                            className="text-lg font-bold text-slate-900 leading-tight hover:text-blue-600 transition-colors"
                                        >
                                            {item.Name}
                                        </Link>
                                        <StockBadge status={effectiveStatus} quantity={effectiveQty} />
                                    </div>
                                    {item.Category && (
                                        <p className="text-xs text-slate-500 mt-1">{item.Category}</p>
                                    )}
                                    <p className="text-2xl font-semibold text-blue-600 mt-2">
                                        ${Number(item.Price).toFixed(2)}
                                    </p>
                                </div>

                                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">
                                        Quantity: <span className="text-slate-900">{effectiveQty}</span>
                                    </span>
                                    <button
                                        className={`text-sm font-semibold transition-colors ${
                                            isOut
                                                ? 'text-slate-400 cursor-not-allowed'
                                                : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                        onClick={() => handleCart(item)}
                                        disabled={isOut}
                                    >
                                        {isOut ? 'Unavailable' : 'Add to Cart →'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {items.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-slate-400">No items match your filters.</p>
                    </div>
                )}

                {/* Server pagination */}
                {totalPages > 1 && (
                    <div className="mt-10 flex justify-center items-center gap-2">
                        <button
                            onClick={() => goToPage(urlPage - 1)}
                            disabled={urlPage <= 1}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {pageWindow.map(p => (
                            <button
                                key={p}
                                onClick={() => goToPage(p)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm border ${
                                    p === urlPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => goToPage(urlPage + 1)}
                            disabled={urlPage >= totalPages}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense>
            <DashboardInner />
        </Suspense>
    );
}
