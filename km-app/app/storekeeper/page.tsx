'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

type Item = {
    ItemID: number;
    SKU: string;
    Name: string;
    Quantity: number;
    Price: number;
    IsSelling: number;
    Category: string | null;
}

function DashboardInner() {
    const [items, setItems] = useState<Item[]>([]);
    const [visibleCount, setVisibleCount] = useState(12);
    const [search, setSearch] = useState('');
    const [showInactive, setShowInactive] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newItem, setNewItem] = useState({
        sku: '',
        name: '',
        category: '',
        quantity: '0',
        price: '0',
        isSelling: true,
    });
    const [editItem, setEditItem] = useState({
        name: '',
        category: '',
        quantity: '0',
        price: '0',
        isSelling: true,
    });
    const params = useSearchParams();
    const router = useRouter();

    async function getItems(query = search) {
        try {
            setErrorMsg('');
            const q = query.trim();
            const url = `/api/admin/items?includeInactive=${showInactive ? 'true' : 'false'}${q ? `&search=${encodeURIComponent(q)}` : ''}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                setItems(data.items);
                setVisibleCount(12);
            } else {
                setErrorMsg(data.message || 'Failed to load items.');
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setErrorMsg('Failed to fetch items.');
        }
    }

    useEffect(() => {
        getItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showInactive]);

    const loadMore = () => setVisibleCount(prev => prev + 12);

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const openEdit = (item: Item) => {
        setEditingItemId(item.ItemID);
        setEditItem({
            name: item.Name,
            category: item.Category || '',
            quantity: String(item.Quantity),
            price: String(item.Price),
            isSelling: item.IsSelling === 1,
        });
    }

    const closeEdit = () => {
        setEditingItemId(null);
    }

    const onSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await getItems(search);
    }

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMsg('');
        setErrorMsg('');
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sku: newItem.sku,
                    name: newItem.name,
                    category: newItem.category,
                    quantity: Number(newItem.quantity),
                    price: Number(newItem.price),
                    isSelling: newItem.isSelling,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Failed to create item.');
                return;
            }

            setStatusMsg('Item added successfully.');
            setNewItem({
                sku: '',
                name: '',
                category: '',
                quantity: '0',
                price: '0',
                isSelling: true,
            });
            setShowAddForm(false);
            await getItems();
        } catch (error) {
            console.error(error);
            setErrorMsg('Failed to create item.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSaveItem = async (itemId: number) => {
        setStatusMsg('');
        setErrorMsg('');
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editItem.name,
                    category: editItem.category,
                    quantity: Number(editItem.quantity),
                    price: Number(editItem.price),
                    isSelling: editItem.isSelling,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Failed to update item.');
                return;
            }

            setStatusMsg('Item updated successfully.');
            setEditingItemId(null);
            await getItems();
        } catch (error) {
            console.error(error);
            setErrorMsg('Failed to update item.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSoftDisable = async (itemId: number) => {
        setStatusMsg('');
        setErrorMsg('');
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/items/${itemId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Failed to remove item from sale.');
                return;
            }

            setStatusMsg('Item removed from sale.');
            if (editingItemId === itemId) {
                setEditingItemId(null);
            }
            await getItems();
        } catch (error) {
            console.error(error);
            setErrorMsg('Failed to remove item from sale.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 mb-8 flex justify-between">
                    <h1 className="mt-2 p-3 text-slate-600">
                        Hey <span className="font-semibold text-blue-600">{params.get('name')}</span>!
                    </h1>
                    <div className="flex justify-between gap-1">
                        <button
                            onClick={() => setShowInactive(prev => !prev)}
                            className='mt-2 p-3 font-semibold text-blue-500 hover:bg-slate-50 hover:text-black rounded-2xl cursor-pointer'
                        >
                            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                        </button>
                        <button
                            onClick={() => setShowAddForm(prev => !prev)}
                            className='mt-2 p-3 font-semibold text-blue-500 hover:bg-slate-50 hover:text-black rounded-2xl cursor-pointer'
                        >
                            Add New Item
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

                <form onSubmit={onSearchSubmit} className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 mb-6 flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by item name or SKU"
                        className="flex-grow px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                        Search
                    </button>
                    <button type="button" onClick={() => { setSearch(''); getItems(''); }} className="px-5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition">
                        Clear
                    </button>
                </form>

                {showAddForm && (
                    <form onSubmit={handleCreateItem} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 mb-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Inventory Item</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input value={newItem.sku} onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))} placeholder="SKU" className="px-3 py-2 rounded-lg border border-slate-300" />
                            <input value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} placeholder="Name" className="px-3 py-2 rounded-lg border border-slate-300" />
                            <input value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))} placeholder="Category" className="px-3 py-2 rounded-lg border border-slate-300" />
                            <input type="number" min="0" step="1" value={newItem.quantity} onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))} placeholder="Quantity" className="px-3 py-2 rounded-lg border border-slate-300" />
                            <input type="number" min="0" step="0.01" value={newItem.price} onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))} placeholder="Price" className="px-3 py-2 rounded-lg border border-slate-300" />
                            <label className="flex items-center gap-2 text-sm text-slate-700 px-2">
                                <input type="checkbox" checked={newItem.isSelling} onChange={(e) => setNewItem(prev => ({ ...prev, isSelling: e.target.checked }))} />
                                Available for sale
                            </label>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                                Save Item
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {(statusMsg || errorMsg) && (
                    <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${errorMsg ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {errorMsg || statusMsg}
                    </div>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.slice(0, visibleCount).map((item) => (
                        <div key={item.ItemID} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                            <div className="p-5 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.Name}</h3>
                                    {item.Quantity > 0 ? (
                                        <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">In Stock</span>
                                    ) : (
                                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">Unavailable</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">SKU: {item.SKU}</p>
                                <p className="text-xs text-slate-500 mt-1">Category: {item.Category || 'N/A'}</p>
                                <p className="text-2xl font-semibold text-blue-600 mt-2">${Number(item.Price).toFixed(2)}</p>
                            </div>

                            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex flex-col gap-3">
                                <span className="text-sm text-slate-500 font-medium">
                                    Quantity: <span className="text-slate-900">{item.Quantity}</span>
                                </span>
                                {editingItemId === item.ItemID ? (
                                    <div className="w-full flex flex-col gap-2">
                                        <input value={editItem.name} onChange={(e) => setEditItem(prev => ({ ...prev, name: e.target.value }))} placeholder="Name" className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                                        <input value={editItem.category} onChange={(e) => setEditItem(prev => ({ ...prev, category: e.target.value }))} placeholder="Category" className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" min="0" step="1" value={editItem.quantity} onChange={(e) => setEditItem(prev => ({ ...prev, quantity: e.target.value }))} placeholder="Quantity" className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                                            <input type="number" min="0" step="0.01" value={editItem.price} onChange={(e) => setEditItem(prev => ({ ...prev, price: e.target.value }))} placeholder="Price" className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                                        </div>
                                        <label className="flex items-center gap-2 text-xs text-slate-700">
                                            <input type="checkbox" checked={editItem.isSelling} onChange={(e) => setEditItem(prev => ({ ...prev, isSelling: e.target.checked }))} />
                                            Available for sale
                                        </label>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSaveItem(item.ItemID)} disabled={isSubmitting} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-60">
                                                Save
                                            </button>
                                            <button onClick={closeEdit} className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                                                Cancel
                                            </button>
                                            <button onClick={() => handleSoftDisable(item.ItemID)} disabled={isSubmitting} className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-60">
                                                Remove from Sale
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => openEdit(item)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors self-end">
                                        Update
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {visibleCount < items.length && (
                    <div className="mt-12 flex justify-center">
                        <button onClick={loadMore} className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
                            Show More Items
                        </button>
                    </div>
                )}

                {items.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-400">Searching the warehouse for items...</p>
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
