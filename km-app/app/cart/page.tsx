'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Cart(){
    const [cart, setCart] = useState([]);
    const params = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function fetchCart() {
            const res = await fetch(`/api/cart/?email=${params.get('email')}`);
            const data = await res.json();
            if (data.success) {
                setCart(data.cart);
            }
        }
        if (params.get('email')) fetchCart();
    }, [params.get('email')]);

    const totalCost = 0;
    if(cart){
        const totalCost = cart.reduce((acc, item) => acc + (item.Price * item.TotalQuantity), 0)
    }
    else{
        const totalCost = 0;
    }
    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-12">
            <div className="max-w-6xl mx-auto">
                
                {/* Navigation Row */}
                <button 
                    onClick={() => {
                        router.back();
                    }}
                    className="flex items-center gap-2 text-indigo-100 hover:text-white mb-8 transition-colors font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">Your Cart</h1>

                {/* Main Content Split Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Left Side: Cart Items */}
                    <div className="w-full lg:w-2/3 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-indigo-400/20">
                        <div className="divide-y divide-slate-100">
                            {cart?.map((item) => (
                                <div key={item.ItemID} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{item.Name}</h2>
                                        <p className="text-slate-500 font-medium">
                                            ${Number(item.Price).toFixed(2)} <span className="text-slate-300 mx-2">|</span> Qty: {item.TotalQuantity}
                                        </p>
                                    </div>
                                    <p className="text-xl font-black text-indigo-600">
                                        ${(item.Price * item.TotalQuantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}

                            {cart?.length === 0 && (
                                <div className="p-20 text-center">
                                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium text-lg">Your cart is currently empty.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="w-full lg:w-1/3 sticky top-8">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>Subtotal</span>
                                    <span>${totalCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold uppercase text-sm tracking-widest">Free</span>
                                </div>
                                <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                                    <span className="text-slate-900 font-bold">Total Amount</span>
                                    <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                                        ${totalCost.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button 
                                disabled={cart?.length === 0}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                Proceed to Checkout
                            </button>
                            
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}