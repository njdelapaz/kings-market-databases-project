'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

type OrderItem = {
    ItemID: number;
    Name: string;
    Quantity: number;
    Price: number;
};

type Order = {
    OrderID: number;
    Timestamp: string;
    Items: OrderItem[];
};

export default function Orders(){
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [openOrd, setOpenOrd] = useState<number | null>(null);

    useEffect(() => {
        async function fetchOrders(){
            try{
                const res = await fetch('/api/orders');
                const data = await res.json();
                if(data.success){
                    setOrders(data.orders);
                }
            } catch(error){
                console.error(error);
            }
        }
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-12">
            <div className="max-w-6xl mx-auto">

                {/* Navigation Row */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-indigo-100 hover:text-white mb-8 transition-colors font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">Your Orders</h1>

                <div className="flex flex-col gap-4">
                    {orders.map((ord) => (
                        <div key={ord.OrderID} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-indigo-400/20">

                            {/* Order Header */}
                            <button
                                onClick={() => setOpenOrd(openOrd === ord.OrderID ? null : ord.OrderID)}
                                className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
                            >
                                <div className="text-left">
                                    <p className="text-lg font-bold text-slate-900">Order #{ord.OrderID}</p>
                                    <p className="text-sm text-slate-500">{dayjs(ord.Timestamp).format('MM/DD/YYYY')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                        {ord.Items.length} {ord.Items.length === 1 ? 'item' : 'items'}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2.5}
                                        stroke="currentColor"
                                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openOrd === ord.OrderID ? 'rotate-180' : ''}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </button>

                            {/* Dropdown Items */}
                            {openOrd === ord.OrderID && (
                                <div className="border-t border-slate-100 divide-y divide-slate-100">
                                    {ord.Items.map((item) => (
                                        <div key={item.ItemID} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="font-semibold text-slate-900">{item.Name}</p>
                                                <p className="text-sm text-slate-500">Qty: {item.Quantity}</p>
                                            </div>
                                            <p className="font-black text-indigo-600">${(item.Price * item.Quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                    <div className="px-6 py-4 flex justify-between items-center bg-slate-50">
                                        <p className="text-sm text-slate-500 font-medium">Order Total</p>
                                        <p className="text-xl font-black text-indigo-600">
                                            ${ord.Items.reduce((acc: number, item: OrderItem) => acc + item.Price * item.Quantity, 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="bg-white/95 rounded-3xl shadow-2xl p-20 text-center border border-indigo-400/20">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 font-medium text-lg">You haven&apos;t placed any orders yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
