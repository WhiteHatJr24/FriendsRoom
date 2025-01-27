import React from 'react';
import { Login } from './components/Login';
import { Chat } from './components/Chat';
import { useStore } from './store/useStore';

function App() {
  const username = useStore((state) => state.username);

  return (
    <div className="min-h-screen bg-gray-100">
      {username ? <Chat /> : <Login />}
    </div>
  );
}

export default App;