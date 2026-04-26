'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
    Email: string;
    PhoneNumber: string;
    Username: string;
};

type FormState = {
    username: string;
    phone: string;
};

export default function ProfilePage() {
    const router = useRouter();

    const [profile,    setProfile]    = useState<Profile | null>(null);
    const [loading,    setLoading]    = useState(true);
    const [errorMsg,   setErrorMsg]   = useState('');
    const [editing,    setEditing]    = useState(false);
    const [saving,     setSaving]     = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [saveError,  setSaveError]  = useState('');
    const [form,       setForm]       = useState<FormState>({ username: '', phone: '' });

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setErrorMsg('');
            try {
                const res = await fetch('/api/profile');
                if (res.redirected || !res.ok) {
                    router.replace('/login');
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setProfile(data.profile);
                    setForm({ username: data.profile.Username, phone: data.profile.PhoneNumber });
                } else {
                    setErrorMsg(data.message || 'Failed to load profile.');
                }
            } catch {
                setErrorMsg('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [router]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaveError('');
        setSuccessMsg('');
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: form.username, phone: form.phone }),
            });
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
                setSuccessMsg('Profile updated successfully.');
                setEditing(false);
            } else {
                setSaveError(data.message || 'Failed to update profile.');
            }
        } catch {
            setSaveError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        if (profile) setForm({ username: profile.Username, phone: profile.PhoneNumber });
        setSaveError('');
        setEditing(false);
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-indigo-600 p-4 md:p-12">
            <div className="max-w-2xl mx-auto">

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-indigo-100 hover:text-white mb-8 transition-colors font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Your Profile</h1>
                    <button
                        onClick={logout}
                        className="p-2 text-sm font-semibold text-indigo-100 rounded-lg hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Sign out
                    </button>
                </div>

                {loading && (
                    <div className="bg-white/95 rounded-3xl shadow-2xl p-16 text-center border border-indigo-400/20">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Loading your profile…</p>
                    </div>
                )}

                {!loading && errorMsg && (
                    <div className="bg-white/95 rounded-3xl shadow-2xl p-12 text-center border border-indigo-400/20">
                        <p className="text-red-500 font-semibold mb-4">{errorMsg}</p>
                        <button
                            onClick={() => router.refresh()}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !errorMsg && profile && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-400/20 overflow-hidden">

                        <div className="bg-indigo-50 px-8 py-8 flex items-center gap-5 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold select-none">
                                {profile.Username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">{profile.Username}</p>
                                <p className="text-sm text-slate-500">{profile.Email}</p>
                            </div>
                        </div>

                        {successMsg && (
                            <div className="mx-8 mt-6 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 font-medium flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                {successMsg}
                            </div>
                        )}

                        {!editing && (
                            <div className="px-8 py-6 space-y-5">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Username</p>
                                    <p className="text-slate-900 font-semibold text-lg">{profile.Username}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Email</p>
                                    <p className="text-slate-900 font-semibold text-lg">{profile.Email}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Phone</p>
                                    <p className="text-slate-900 font-semibold text-lg">{profile.PhoneNumber}</p>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={() => { setSuccessMsg(''); setEditing(true); }}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {editing && (
                            <form onSubmit={handleSave} className="px-8 py-6 space-y-5">
                                {saveError && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                                        {saveError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        minLength={2}
                                        value={form.username}
                                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                        className="block w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Email</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={profile.Email}
                                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="block w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
