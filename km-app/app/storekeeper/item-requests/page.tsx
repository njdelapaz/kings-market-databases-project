'use client'

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

type RequestStatus = 'pending' | 'approved' | 'rejected';

type ItemRequest = {
    ID: number;
    CustomerEmail: string;
    Name: string;
    Description: string | null;
    Status: RequestStatus;
    ReviewedBy: string | null;
    ReviewedAt: string | null;
};

type SortOption = 'date' | 'name';

const STATUS_TABS: { value: '' | RequestStatus; label: string }[] = [
    { value: '',          label: 'All' },
    { value: 'pending',   label: 'Pending' },
    { value: 'approved',  label: 'Approved' },
    { value: 'rejected',  label: 'Rejected' },
];

function StatusBadge({ status }: { status: RequestStatus }) {
    if (status === 'approved') {
        return (
            <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                Approved
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                Rejected
            </span>
        );
    }
    return (
        <span className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
            Pending
        </span>
    );
}

function ItemRequestsInner() {
    const router = useRouter();

    const [requests,    setRequests]    = useState<ItemRequest[]>([]);
    const [loading,     setLoading]     = useState(true);
    const [errorMsg,    setErrorMsg]    = useState('');
    const [statusFilter, setStatusFilter] = useState<'' | RequestStatus>('');
    const [sortBy,      setSortBy]      = useState<SortOption>('date');
    const [actioning,   setActioning]   = useState<Record<number, boolean>>({});

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const qs = new URLSearchParams();
            if (statusFilter) qs.set('status', statusFilter);
            qs.set('sort', sortBy);
            const res  = await fetch(`/api/item-requests?${qs.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests ?? []);
            } else {
                setErrorMsg(data.error || 'Failed to load requests.');
            }
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, sortBy]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    async function handleAction(id: number, action: 'approve' | 'reject') {
        setActioning(prev => ({ ...prev, [id]: true }));
        try {
            const res  = await fetch(`/api/item-requests/${id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ action }),
            });
            const data = await res.json();
            if (data.success) {
                setRequests(prev =>
                    prev.map(r => r.ID === id ? { ...r, ...data.request } : r)
                );
            } else {
                setErrorMsg(data.error || 'Action failed.');
            }
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setActioning(prev => { const next = { ...prev }; delete next[id]; return next; });
        }
    }

    async function handleDelete(id: number) {
        setActioning(prev => ({ ...prev, [id]: true }));
        try {
            const res  = await fetch(`/api/item-requests/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setRequests(prev => prev.filter(r => r.ID !== id));
            } else {
                setErrorMsg(data.error || 'Delete failed.');
            }
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setActioning(prev => { const next = { ...prev }; delete next[id]; return next; });
        }
    }

    const pendingCount = requests.filter(r => r.Status === 'pending').length;

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Customer Item Requests</h1>
                        {pendingCount > 0 && (
                            <p className="text-sm text-amber-600 mt-0.5 font-medium">
                                {pendingCount} pending review
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => router.push('/storekeeper')}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 mb-6 flex flex-wrap items-center gap-4 justify-between">
                    {/* Status tab pills */}
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                                    statusFilter === tab.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                        <option value="date">Newest First</option>
                        <option value="name">Name A–Z</option>
                    </select>
                </div>

                {/* Error */}
                {errorMsg && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                        {errorMsg}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-2xl p-10 flex justify-center border border-slate-200 shadow-sm">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && requests.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
                        <p className="text-slate-400 text-sm">No requests found.</p>
                    </div>
                )}

                {/* Cards grid */}
                {!loading && requests.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {requests.map(req => {
                            const busy = !!actioning[req.ID];
                            return (
                                <div
                                    key={req.ID}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                                >
                                    <div className="p-5 flex-grow">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-slate-900 leading-tight text-base">{req.Name}</h3>
                                            <StatusBadge status={req.Status} />
                                        </div>
                                        <p className="text-xs text-slate-400 mb-1">{req.CustomerEmail}</p>
                                        {req.Description && (
                                            <p className="text-sm text-slate-600 mt-2 line-clamp-3">{req.Description}</p>
                                        )}
                                        {req.ReviewedAt && (
                                            <p className="text-xs text-slate-400 mt-3">
                                                Reviewed by {req.ReviewedBy} &middot; {new Date(req.ReviewedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex gap-2">
                                        {req.Status === 'pending' && (
                                            <>
                                                <button
                                                    disabled={busy}
                                                    onClick={() => handleAction(req.ID, 'approve')}
                                                    className="flex-1 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={busy}
                                                    onClick={() => handleAction(req.ID, 'reject')}
                                                    className="flex-1 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            disabled={busy}
                                            onClick={() => handleDelete(req.ID)}
                                            title="Delete permanently"
                                            className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ItemRequestsPage() {
    return (
        <Suspense>
            <ItemRequestsInner />
        </Suspense>
    );
}
