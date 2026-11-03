import { Channel, UserProfile } from '../types/chat';

export interface ChatPartnerInfo {
  displayName: string;
  username: string;
  avatarColor?: string;
  status?: 'online' | 'offline' | 'away';
  uid?: string;
}

/**
 * Returns the OTHER participant's information for a direct message (DM) channel.
 * Resolves the issue where each participant saw their own name in the DM list.
 */
export function getDirectChatPartner(
  channel: Channel,
  currentUserId?: string,
  allUsers: UserProfile[] = []
): ChatPartnerInfo | null {
  if (channel.type !== 'direct' || !channel.memberIds) return null;

  // The other participant's UID
  const otherUid = channel.memberIds.find((id) => id !== currentUserId);
  if (!otherUid) return null;

  const foundUser = allUsers.find((u) => u.uid === otherUid);
  if (foundUser) {
    return {
      displayName: foundUser.displayName,
      username: foundUser.username,
      avatarColor: foundUser.avatarColor,
      status: foundUser.status,
      uid: foundUser.uid
    };
  }

  // Fallback: clean the name if other user not loaded yet
  const fallbackClean = channel.name.replace(/^@/, '');
  return {
    displayName: fallbackClean,
    username: fallbackClean
  };
}
