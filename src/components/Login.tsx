import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { generateKeyPair, exportPublicKey } from '../lib/crypto';
import { useStore } from '../store/useStore';

export function Login() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const setStoreUsername = useStore((state) => state.setUsername);
  const setKeyPair = useStore((state) => state.setKeyPair);
  const addUser = useStore((state) => state.addUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const keyPair = await generateKeyPair();
      const publicKeyString = await exportPublicKey(keyPair.publicKey);

      addUser({ username, publicKey: publicKeyString });
      setKeyPair(keyPair);
      setStoreUsername(username);
    } catch (error) {
      console.error('Error during login:', error);
      alert('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-indigo-600 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join Secure Chat
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            End-to-end encrypted messaging
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}