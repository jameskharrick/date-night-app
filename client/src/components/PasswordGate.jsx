import { useState } from 'react';
import { Wine } from 'lucide-react';
import { storePassword } from '../utils/password';

export default function PasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    storePassword(password.trim());
    window.location.reload();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-slate-700 rounded-full p-3 mb-3">
            <Wine className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">James &amp; Gurleen Date Night</h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            Enter your shared password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg px-4 py-2.5 transition"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
