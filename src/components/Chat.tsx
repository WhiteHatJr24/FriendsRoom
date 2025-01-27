import React, { useState, useRef, useEffect } from 'react';
import { Send, LogOut, Search, Users, UserPlus, Bell, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { encryptMessage, importPublicKey } from '../lib/crypto';
import { FriendRequest } from '../types';

export function Chat() {
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { username, keyPair } = useStore();
  const users = useStore((state) => state.users);
  const messages = useStore((state) => state.messages);
  const addMessage = useStore((state) => state.addMessage);
  const removeUser = useStore((state) => state.removeUser);
  const selectedUser = useStore((state) => state.selectedUser);
  const setSelectedUser = useStore((state) => state.setSelectedUser);
  const friendRequests = useStore((state) => state.friendRequests);
  const addFriendRequest = useStore((state) => state.addFriendRequest);
  const updateFriendRequest = useStore((state) => state.updateFriendRequest);
  const notifications = useStore((state) => state.notifications);
  const removeNotification = useStore((state) => state.removeNotification);

  const filteredUsers = users.filter(user => 
    user.username !== username && 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter(message => 
    (message.sender === username && message.recipient === selectedUser) || 
    (message.sender === selectedUser && message.recipient === username)
  );

  const pendingRequests = friendRequests.filter(req => 
    req.to === username && req.status === 'pending'
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !username || !selectedUser) return;

    try {
      const recipient = users.find(u => u.username === selectedUser);
      if (!recipient) throw new Error('Recipient not found');

      const publicKey = await importPublicKey(recipient.publicKey);
      const encrypted = await encryptMessage(newMessage, publicKey);
      
      const message = {
        id: Date.now().toString(),
        sender: username,
        recipient: selectedUser,
        content: newMessage,
        created_at: new Date().toISOString()
      };
      
      addMessage(message);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleSendRequest = (toUsername: string) => {
    const request: FriendRequest = {
      from: username!,
      to: toUsername,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    addFriendRequest(request);
  };

  const handleRequestResponse = (request: FriendRequest, status: 'accepted' | 'rejected') => {
    updateFriendRequest(request.from, request.to, status);
  };

  const handleLogout = () => {
    removeUser(username!);
    window.location.reload();
  };

  const isFriend = (otherUsername: string) => {
    return friendRequests.some(req => 
      ((req.from === username && req.to === otherUsername) ||
       (req.from === otherUsername && req.to === username)) &&
      req.status === 'accepted'
    );
  };

  const hasPendingRequest = (otherUsername: string) => {
    return friendRequests.some(req => 
      req.from === username && 
      req.to === otherUsername && 
      req.status === 'pending'
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Notifications Dropdown */}
      {showNotifications && notifications.length > 0 && (
        <div className="absolute right-4 top-16 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <p className="text-sm">{notification}</p>
                  <button
                    onClick={() => removeNotification(notification)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-full relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Friend Requests</h3>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.from} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm font-medium">{request.from}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequestResponse(request, 'accepted')}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRequestResponse(request, 'rejected')}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.username}
              className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                selectedUser === user.username ? 'bg-indigo-50' : ''
              }`}
            >
              <button
                onClick={() => setSelectedUser(user.username)}
                className="flex items-center space-x-3 flex-1"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 text-left">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isFriend(user.username) ? 'Friend' : 
                     hasPendingRequest(user.username) ? 'Request sent' : ''}
                  </p>
                </div>
              </button>
              {!isFriend(user.username) && !hasPendingRequest(user.username) && (
                <button
                  onClick={() => handleSendRequest(user.username)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold text-gray-900">
              {selectedUser ? `Chat with ${selectedUser}` : 'Select a user to start chatting'}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === username
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-xs opacity-75 mb-1">{message.sender}</p>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t">
          <div className="max-w-7xl mx-auto flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedUser ? "Type a message..." : "Select a user to start chatting"}
              disabled={!selectedUser || !isFriend(selectedUser)}
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="submit"
              disabled={!selectedUser || !isFriend(selectedUser)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
