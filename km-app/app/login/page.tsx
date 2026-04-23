'use client'

import React, {useState} from 'react';
import { useRouter } from 'next/navigation';


// Assuming role, username, email, setRole, setUsername, setEmail, and error are passed as props or managed via state above
export default function LoginPage() {

    const router = useRouter();

    // roles, username, email, and error variables.
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');




    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const params = new URLSearchParams({
            name: username,
            email: email,
            role: role
        });

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, username, email })
        });

        const data = await res.json();
        if (data.success) {
            console.log(`Logged In As ${role}!`);
            // redirect user to dashboard for items.
            router.push(`/${role}?name=${username}&email=${email}`);
        } else {
            setError(data.error);
        }
    }

    return (
        <div className="min-h-screen bg-indigo-600 flex flex-col justify-center py-10 px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-extrabold text-white tracking-tight">
                    Welcome Back to Kings Market!
                </h1>
                <p className="mt-2 text-center text-sm text-stone-100">
                    Please sign in to your account
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-slate-200">
                    
                    {/** role selection tabs!*/}
                    <div className="flex p-1 bg-slate-100 rounded-lg mb-8">
                        <button
                            onClick={() => setRole('customer')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                role === 'customer' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Customer
                        </button>
                        <button
                            onClick={() => setRole('storekeeper')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                role === 'storekeeper' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Storekeeper
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="name@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}