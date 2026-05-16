// Invite helpers — Rec'd
// TODO: Replace with Supabase invite records

import { Invite } from '@/lib/types';
import { generateId, generateInviteCode } from '@/lib/utils';

export function createInviteLink(groupId?: string, invitedBy: string = 'user-1'): Invite {
  const code = generateInviteCode();
  return {
    id: generateId('inv'),
    inviteType: groupId ? 'group' : 'crew',
    invitedBy,
    inviteUrl: `https://recd.app/invite/${code}`,
    inviteCode: code,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const INVITE_MESSAGES = {
  copied: [
    'Invite copied. Choose wisely.',
    'Link copied. Let the judging begin.',
  ],
  sent: [
    'Invite sent. Their taste is now involved.',
  ],
};

export function getInvitePreviewMessage(inviterName: string, groupName?: string): string {
  if (groupName) {
    return `${inviterName} invited you to join ${groupName} on Rec'd — recommend movies, stamp good picks, and settle who actually has taste.`;
  }
  return `${inviterName} invited you to Rec'd — recommend movies to your crew, get stamped, and prove your taste.`;
}
