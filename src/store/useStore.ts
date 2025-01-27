import { create } from 'zustand';
import { CryptoKeyPair, Message, User, FriendRequest } from '../types';

interface Store {
  keyPair: CryptoKeyPair | null;
  setKeyPair: (keyPair: CryptoKeyPair) => void;
  username: string | null;
  setUsername: (username: string) => void;
  users: User[];
  addUser: (user: User) => void;
  removeUser: (username: string) => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  selectedUser: string | null;
  setSelectedUser: (username: string | null) => void;
  friendRequests: FriendRequest[];
  addFriendRequest: (request: FriendRequest) => void;
  updateFriendRequest: (from: string, to: string, status: 'accepted' | 'rejected') => void;
  notifications: string[];
  addNotification: (notification: string) => void;
  removeNotification: (notification: string) => void;
}

export const useStore = create<Store>((set) => ({
  keyPair: null,
  setKeyPair: (keyPair) => set({ keyPair }),
  username: null,
  setUsername: (username) => set({ username }),
  users: [],
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  removeUser: (username) => set((state) => ({
    users: state.users.filter(u => u.username !== username),
    selectedUser: state.selectedUser === username ? null : state.selectedUser
  })),
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  selectedUser: null,
  setSelectedUser: (username) => set({ selectedUser: username }),
  friendRequests: [],
  addFriendRequest: (request) => set((state) => ({
    friendRequests: [...state.friendRequests, request],
    notifications: [...state.notifications, `New friend request from ${request.from}`]
  })),
  updateFriendRequest: (from, to, status) => set((state) => {
    const updatedRequests = state.friendRequests.map(req => 
      req.from === from && req.to === to 
        ? { ...req, status } 
        : req
    );
    return {
      friendRequests: updatedRequests,
      notifications: [...state.notifications, 
        status === 'accepted' 
          ? `${to} accepted your friend request`
          : `${to} rejected your friend request`
      ]
    };
  }),
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  removeNotification: (notification) => set((state) => ({
    notifications: state.notifications.filter(n => n !== notification)
  }))
}));
