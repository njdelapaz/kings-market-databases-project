/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

type Item = {
    ItemID: number;
    Name: string;
    Quantity: number;
    Price: number | string;
    IsSelling: number | boolean;
};

export default function Dashboard() {
    const [items, setItems] = useState<Item[]>([]);
    const [visibleCount, setVisibleCount] = useState(12); // How many items to show initially
    const params = useSearchParams();
    const router = useRouter();
    const [alert, setAlert] = useState({show: false, itemName: ''});

    async function updateItem(Item: Item, delta: number){
        try{
            const res = await fetch('api/items',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({'itemID': Item.ItemID, 'delta': delta})
            });

            const data = await res.json();
            if(data.success){
                console.log("Item updated successfully!");
                return;
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

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

    async function handleCart(item: Item) {
        console.log("Item being added:", item);
        try{
            const info = {
                itemID: item.ItemID,
                CustomerEmail: params.get('email'),
                action: 'Add',
                timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss') //easy way to format date using small library.
            }

            const res = await fetch('api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(info)
            })

            const data = await res.json();
            if (data.success){
                updateItem(item, -1);
                // updating local state immediately.
                setItems(prevItems => 
                    prevItems.map(prevItem => 
                        prevItem.ItemID === item.ItemID 
                            ? { ...prevItem, Quantity: prevItem.Quantity - 1 } 
                            : prevItem
                    )
                );
                setAlert({show: true, itemName: item.Name});
                setTimeout(() => {
                    setAlert({ show: false, itemName: '' });
                }, 3000); //clear alert after 3 seconds.
            }

        }
        catch(error){
            console.log("Error: ", error)
        }
    }

    useEffect(() => {
        getItems();
    }, []);

    const loadMore = () => {
        setVisibleCount(prev => prev + 12); // when we click to show more items, add 12 more to show each time.
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    }

    const viewCart = () => {
        router.push(`/cart?email=${params.get('email')}`);
    }
    
    const viewPastOrders = () => {
        router.push(`/orderView?email=${params.get('email')}`);
    }

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
                {alert.show && (
                <div className="fixed top-5 right-5 z-50 animate-fade-in-down">
                    <div id="alert-1" className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 border border-blue-200 shadow-lg" role="alert">
                        <svg className="w-4 h-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                        <div className="ms-2 text-sm font-medium">
                            {alert.itemName} added successfully!
                        </div>
                        <button 
                            onClick={() => setAlert({ show: false, itemName: '' })} 
                            className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-100 inline-flex items-center justify-center h-8 w-8"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 mb-8 flex justify-between">
                    <h1 className="mt-2 p-3 text-slate-600">
                        Hey <span className="font-semibold text-blue-600">{params.get('name')}</span>! 
                    </h1>
                    <div className = "flex justify-between gap-1">
                        <button 
                            className='mt-2 p-3 font-semibold text-indigo-600 hover:text-black hover:bg-slate-50 rounded-2xl cursor-pointer'
                            onClick={() => viewCart()}
                            >
                            Cart
                        </button>
                        <button 
                            className='mt-2 p-3 font-semibold text-indigo-600 hover:text-black hover:bg-slate-50 rounded-2xl cursor-pointer'
                            onClick={() => viewPastOrders()}
                            >
                            Past Orders
                        </button>
                        <h1 className='mt-2 p-3 font-semibold text-indigo-600 hover:text-black hover:bg-slate-50 rounded-2xl cursor-pointer'>
                            Item Requests
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
                                <button 
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                    onClick={() => handleCart(item)}
                                
                                >
                                    {/** only runs when clicked. */}
                                    Add to Cart &rarr;
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