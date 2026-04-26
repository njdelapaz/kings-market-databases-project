'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';

type Item = {
    ItemID: number;
    SKU: string;
    Name: string;
    Quantity: number;
    Price: number;
    IsSelling: number;
    Category: string | null;
}

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

function DashboardInner() {
    const [items, setItems] = useState<Item[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [showInactive, setShowInactive] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [importMsg, setImportMsg] = useState('');
    const [exportMsg, setExportMsg] = useState('');
    const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
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
    const storekeeperEmail = params.get('email') ?? '';
    const pageSize = 12;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const getItems = useCallback(async () => {
        try {
            setErrorMsg('');
            const q = appliedSearch.trim();
            const qs = new URLSearchParams();
            qs.set('includeInactive', showInactive ? 'true' : 'false');
            if (q) qs.set('search', q);
            if (categoryFilter) qs.set('category', categoryFilter);
            if (minPriceFilter.trim()) qs.set('minPrice', minPriceFilter.trim());
            if (maxPriceFilter.trim()) qs.set('maxPrice', maxPriceFilter.trim());
            qs.set('sort', sortKey);
            qs.set('order', sortOrder);
            qs.set('page', String(page));
            qs.set('pageSize', String(pageSize));

            const url = `/api/admin/items?${qs.toString()}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                setItems(data.items ?? []);
                setTotal(Number(data.total) || 0);
            } else {
                setErrorMsg(data.message || 'Failed to load items.');
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setErrorMsg('Failed to fetch items.');
        }
    }, [appliedSearch, categoryFilter, maxPriceFilter, minPriceFilter, page, pageSize, showInactive, sortKey, sortOrder]);

    useEffect(() => {
        getItems();
    }, [getItems]);

    useEffect(() => {
        let cancelled = false;
        async function loadCategories() {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (!cancelled && data.success) {
                    setCategories(data.categories ?? []);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        }
        loadCategories();
        return () => { cancelled = true; };
    }, []);

    const goToPage = (nextPage: number) => {
        const clamped = Math.min(Math.max(1, nextPage), totalPages);
        if (clamped !== page) setPage(clamped);
    };

    const pageWindow = useMemo(() => {
        const window: number[] = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, start + 4);
        for (let p = start; p <= end; p++) window.push(p);
        return window;
    }, [page, totalPages]);

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
        setAppliedSearch(search.trim());
        setPage(1);
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

    const handleImportInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        setImportMsg('');
        setErrorMsg('');

        if (!storekeeperEmail) {
            setErrorMsg('Missing storekeeper email in URL. Please log in again.');
            return;
        }
        if (!importFile) {
            setImportMsg('Choose a file to import.');
            return;
        }

        const selectedFormat = importFormat;
        if (selectedFormat === 'csv' && !importFile.name.toLowerCase().endsWith('.csv')) {
            setImportMsg('Please choose a .csv file for CSV import.');
            return;
        }
        if (selectedFormat === 'json' && !importFile.name.toLowerCase().endsWith('.json')) {
            setImportMsg('Please choose a .json file for JSON import.');
            return;
        }

        setIsImporting(true);
        try {
            const text = await importFile.text();
            const content = selectedFormat === 'json' ? JSON.parse(text) : text;

            const res = await fetch('/api/admin/import/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    format: selectedFormat,
                    content,
                    filename: importFile.name,
                    storekeeperEmail,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setImportMsg(data.message || 'Import failed.');
                return;
            }

            setImportMsg(`Import complete. Rows processed: ${data.rowsProcessed}.`);
            setImportFile(null);
            await getItems();
        } catch (error) {
            console.error('Import failed:', error);
            setImportMsg('Import failed. Check file format and try again.');
        } finally {
            setIsImporting(false);
        }
    };

    const handleExportInventory = async (format: 'csv' | 'json') => {
        setExportMsg('');
        setErrorMsg('');
        if (!storekeeperEmail) {
            setErrorMsg('Missing storekeeper email in URL. Please log in again.');
            return;
        }

        setIsExporting(true);
        try {
            const qs = new URLSearchParams({
                format,
                includeInactive: showInactive ? 'true' : 'false',
                storekeeperEmail,
            });

            const res = await fetch(`/api/admin/export/inventory?${qs.toString()}`);
            if (!res.ok) {
                let message = 'Export failed.';
                try {
                    const err = await res.json();
                    message = err.message || message;
                } catch {
                    // ignore json parse errors for non-json responses
                }
                setExportMsg(message);
                return;
            }

            if (format === 'csv') {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } else {
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data.data ?? [], null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename || `inventory_export_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
            setExportMsg(`Exported inventory as ${format.toUpperCase()}.`);
        } catch (error) {
            console.error('Export failed:', error);
            setExportMsg('Export failed.');
        } finally {
            setIsExporting(false);
        }
    };

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
                            onClick={() => {
                                setShowInactive(prev => !prev);
                                setPage(1);
                            }}
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

                <form onSubmit={onSearchSubmit} className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by item name or SKU"
                        className="md:col-span-5 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900 placeholder-slate-400"
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
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
                        value={minPriceFilter}
                        onChange={(e) => {
                            setMinPriceFilter(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Min price"
                        className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900 placeholder-slate-400"
                    />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={maxPriceFilter}
                        onChange={(e) => {
                            setMaxPriceFilter(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Max price"
                        className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900 placeholder-slate-400"
                    />
                    <select
                        value={`${sortKey}:${sortOrder}`}
                        onChange={(e) => {
                            const [nextSort, nextOrder] = e.target.value.split(':') as [SortKey, SortOrder];
                            setSortKey(nextSort);
                            setSortOrder(nextOrder);
                            setPage(1);
                        }}
                        className="md:col-span-4 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-900"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <div className="md:col-span-8 flex items-center justify-between text-sm text-slate-500">
                        <span>{total} item{total === 1 ? '' : 's'} found</span>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setAppliedSearch('');
                                setCategoryFilter('');
                                setMinPriceFilter('');
                                setMaxPriceFilter('');
                                setSortKey('name');
                                setSortOrder('asc');
                                setPage(1);
                            }}
                            className="px-3 py-1 text-slate-600 hover:text-slate-900"
                        >
                            Clear filters
                        </button>
                    </div>
                    <div className="md:col-span-12 flex justify-end">
                        <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                            Apply Search
                        </button>
                    </div>
                </form>

                <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 mb-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Import / Export Inventory</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <form onSubmit={handleImportInventory} className="border border-slate-200 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Import (CSV/JSON)</h3>
                            <div className="flex flex-col gap-3">
                                <select
                                    value={importFormat}
                                    onChange={(e) => setImportFormat(e.target.value as 'csv' | 'json')}
                                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
                                >
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                </select>
                                <input
                                    type="file"
                                    accept={importFormat === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                                    className="text-sm text-slate-700"
                                />
                                <button
                                    type="submit"
                                    disabled={isImporting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {isImporting ? 'Importing...' : 'Run Import'}
                                </button>
                            </div>
                        </form>

                        <div className="border border-slate-200 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Export Inventory</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleExportInventory('csv')}
                                    disabled={isExporting}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 disabled:opacity-60"
                                >
                                    Export CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportInventory('json')}
                                    disabled={isExporting}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 disabled:opacity-60"
                                >
                                    Export JSON
                                </button>
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                                Export respects current active/inactive toggle.
                            </p>
                        </div>
                    </div>

                    {(importMsg || exportMsg) && (
                        <p className="mt-4 text-sm text-slate-600">
                            {importMsg || exportMsg}
                        </p>
                    )}
                </div>

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
                    {items.map((item) => (
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

                {totalPages > 1 && (
                    <div className="mt-10 flex justify-center items-center gap-2">
                        <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page <= 1}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {pageWindow.map((p) => (
                            <button
                                key={p}
                                onClick={() => goToPage(p)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm border ${
                                    p === page
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
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
