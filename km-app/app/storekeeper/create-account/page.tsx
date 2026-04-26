'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CreateStorekeeperAccountInner() {
  const router = useRouter();
  const params = useSearchParams();
  const name = params.get('name') || '';
  const email = params.get('email') || '';

  const [username, setUsername] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/storekeepers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: accountEmail,
          phone,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to create account.');
        return;
      }
      setStatusMsg('Storekeeper account created.');
      setUsername('');
      setAccountEmail('');
      setPhone('');
      setPassword('');
      setConfirm('');
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Create Storekeeper Account</h1>
              <p className="text-sm text-slate-500 mt-1">Add a new storekeeper login profile.</p>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/storekeeper?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`
                )
              }
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
            >
              Back
            </button>
          </div>

          {(errorMsg || statusMsg) && (
            <div
              className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                errorMsg
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}
            >
              {errorMsg || statusMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300"
            />
            <input
              type="tel"
              required
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300"
            />
            <input
              type="password"
              minLength={8}
              required
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300"
            />
            <input
              type="password"
              required
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateStorekeeperAccountPage() {
  return (
    <Suspense>
      <CreateStorekeeperAccountInner />
    </Suspense>
  );
}
