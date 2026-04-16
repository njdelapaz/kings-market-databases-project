/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [items, setItems] = useState([]);
    const [visibleCount, setVisibleCount] = useState(12); // How many items to show initially
    const params = useSearchParams();

    async function getItems() {
        try {
            const res = await fetch('/api/items', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            if (data.success) {
                // Fix: Access data.items specifically
                setItems(data.items);
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

    useEffect(() => {
        getItems();
    }, []);

    const loadMore = () => {
        setVisibleCount(prev => prev + 12); // when we click to show more items, add 12 more to show each time.
    };

    const logout = () => {
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-8xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 mb-8 flex justify-between">
                    <h1 className="mt-2 p-3 text-slate-600">
                        Hey <span className="font-semibold text-blue-600">{params.get('name')}</span>! 
                    </h1>
                    <div className = "flex justify-between gap-1">
                        <h1 className='mt-2 p-3 font-semibold text-blue-500  hover:bg-slate-50 hover:text-black rounded-2xl cursor-pointer'>
                            Update Log
                        </h1>
                        <h1 className='mt-2 p-3 font-semibold text-blue-500 hover:bg-slate-50 hover:text-black rounded-2xl cursor-pointer'>
                            Add New Item
                        </h1>
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

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.slice(0, visibleCount).map((item, index) => (
                        <div 
                            key={index} 
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                        >
                            {/* Card Header/Title */}
                            <div className="p-5 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                        {item.Name}
                                    </h3>
                                    {item.Quantity > 0 ? (
                                        <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                                            In Stock
                                        </span>
                                    ) : (
                                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                                            Unavailable
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-2xl font-semibold text-blue-600 mt-2">
                                    ${Number(item.Price).toFixed(2)}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">
                                    Quantity: <span className="text-slate-900">{item.Quantity}</span>
                                </span>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Update
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination / Load More */}
                {visibleCount < items.length && (
                    <div className="mt-12 flex justify-center">
                        <button 
                            onClick={loadMore}
                            className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                        >
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