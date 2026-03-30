import type { ProfileInfo } from './types';
import type { Conversation } from '../../../services/conversationService';
import type { RoomMessage } from '../../../services/roomService';

/** Build a rich designation string: "LGA Coordinator — Ikeja, Lagos" */
export function richDesignation(p: {
  designation: string | null;
  assigned_ward?: string | null;
  assigned_lga?: string | null;
  assigned_state?: string | null;
}): string {
  const d = p.designation;
  if (!d) return '';
  const parts: string[] = [];
  if (p.assigned_ward) parts.push(p.assigned_ward);
  if (p.assigned_lga) parts.push(p.assigned_lga);
  if (p.assigned_state) parts.push(p.assigned_state);
  if (parts.length === 0) return d;
  return `${d} — ${parts.join(', ')}`;
}

/** Map a Conversation to ProfileInfo */
export function convToProfile(c: Conversation): ProfileInfo {
  return {
    name: c.participant_name,
    image: c.participant_image,
    designation: c.participant_designation,
    assigned_state: c.participant_assigned_state,
    assigned_lga: c.participant_assigned_lga,
    assigned_ward: c.participant_assigned_ward,
    voting_state: c.participant_voting_state,
    voting_lga: c.participant_voting_lga,
    voting_ward: c.participant_voting_ward,
    voting_pu: c.participant_voting_pu,
  };
}

/** Map a RoomMessage to ProfileInfo */
export function msgToProfile(m: RoomMessage): ProfileInfo {
  return {
    name: m.sender_name,
    image: m.sender_image,
    designation: m.sender_designation,
    assigned_state: m.sender_assigned_state,
    assigned_lga: m.sender_assigned_lga,
    assigned_ward: m.sender_assigned_ward,
    voting_state: m.sender_voting_state,
    voting_lga: m.sender_voting_lga,
    voting_ward: m.sender_voting_ward,
    voting_pu: m.sender_voting_pu,
  };
}

/** Format a timestamp for sidebar display */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Format a date for message group headers */
export function formatDateHeader(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
