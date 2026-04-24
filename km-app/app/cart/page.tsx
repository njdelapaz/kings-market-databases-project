'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

type CartItem = {
    ItemID: number;
    Name: string;
    Price: number;
    TotalQuantity: number;
};

type PaymentInfo = {
    ID: number;
    Type: string;
    Provider: string;
    Last4: string;
    ExpMonth: number;
    ExpYear: number;
};

export default function Cart(){
    const [cart, setCart] = useState<Record<string, CartItem>>({});
    const router = useRouter();
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo[] | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(true);

    useEffect(() => {
        async function fetchPaymentInfo(){
            try{
                const res = await fetch('/api/paymentInfo/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                const data = await res.json();
                if(data.success){
                    setPaymentInfo(data.paymentInfo);
                }
            } catch(err){
                console.error(err);
            } finally {
                setPaymentLoading(false);
            }
        }

        async function fetchCart() {
            const res = await fetch('/api/cart');
            const data = await res.json();
            if (data.success) {
                const cartMap = (data.cart ?? []).reduce((acc: Record<string, CartItem>, item: CartItem) => {
                    acc[item.ItemID] = item;
                    return acc;
                }, {});
                setCart(cartMap);
            }
        }

        fetchCart();
        fetchPaymentInfo();
    }, []);

    async function checkout(){
        try{
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ cart })
            });
            const data = await res.json();
            if(data.success){
                setCart({});
                router.back();
            }
        } catch(err){
            console.error(err);
        }
    }

    const totalCost = Object.values(cart).reduce((acc: number, item: CartItem) => {
        return acc + (item.Price * item.TotalQuantity);
    }, 0);

    const isPaymentReady = !!paymentInfo && paymentInfo.length > 0;
    const payment = paymentInfo?.[0];

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

                <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">Your Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Side: Cart Items + Payment */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-6">

                        {/* Cart Items */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-indigo-400/20">
                            <div className="divide-y divide-slate-100">
                                {Object.values(cart).map((item) => (
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

                                {Object.values(cart).length === 0 && (
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

                        {/* Payment Information */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-indigo-400/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-50 rounded-xl p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Payment Information</h2>
                                {isPaymentReady && (
                                    <span className="ml-auto text-xs bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full">
                                        Saved
                                    </span>
                                )}
                            </div>

                            {paymentLoading ? (
                                <div className="flex items-center gap-3 text-slate-400 py-4">
                                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span className="font-medium">Loading your payment details…</span>
                                </div>
                            ) : isPaymentReady && payment ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Card Type",   value: payment.Type },
                                        { label: "Provider",    value: payment.Provider },
                                        { label: "Card Number", value: `•••• •••• •••• ${payment.Last4}`, full: true },
                                        { label: "Expiration",  value: dayjs(`${payment.ExpYear}-${String(payment.ExpMonth).padStart(2,'0')}-01`).format('MM/YY') },
                                    ].map(({ label, value, full }) => (
                                        <div key={label} className={full ? "col-span-2" : ""}>
                                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                                            <p className="bg-slate-50 rounded-xl px-4 py-2.5 text-slate-800 font-medium text-sm border border-slate-100 tracking-wide">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="col-span-2 pt-2">
                                        <button
                                            onClick={() => router.push("/account/payment")}
                                            className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors"
                                        >
                                            Edit payment info →
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-slate-500 mb-4">No payment method saved.</p>
                                    <button
                                        onClick={() => router.push("/account/payment")}
                                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                                    >
                                        Add Payment Method
                                    </button>
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
                                disabled={Object.values(cart).length === 0 || !isPaymentReady}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
                                onClick={() => checkout()}
                            >
                                Proceed to Checkout
                            </button>

                            {!isPaymentReady && Object.values(cart).length > 0 && !paymentLoading && (
                                <p className="text-center text-xs text-slate-400 mt-3">Add a payment method to continue</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
