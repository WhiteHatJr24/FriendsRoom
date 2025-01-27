export interface Message {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export interface CryptoKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface User {
  username: string;
  publicKey: string;
  status?: 'pending' | 'friend' | 'rejected';
}

export interface FriendRequest {
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}