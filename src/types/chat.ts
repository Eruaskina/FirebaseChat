export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  avatarColor: string;
  status: 'online' | 'offline' | 'away';
  bio?: string;
  createdAt: string;
  lastSeen: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'direct';
  creatorId?: string;
  memberIds?: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface MessageReaction {
  [emoji: string]: string[]; // array of userIds who reacted
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderColor?: string;
  text: string;
  type?: 'text' | 'code' | 'image' | 'system';
  codeLanguage?: string;
  reactions?: MessageReaction;
  createdAt: string;
}

export interface TypingUser {
  userId: string;
  displayName: string;
  timestamp: number;
}
