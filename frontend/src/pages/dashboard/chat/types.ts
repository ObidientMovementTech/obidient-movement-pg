export const FONT = '"Poppins", sans-serif';
export const PRIMARY = '#006837';
export const PRIMARY_DARK = '#00502d';
export const PRIMARY_LIGHT = 'rgba(0,104,55,0.06)';
export const ACCENT = '#8cc63f';

// Surface palette (Material Design 3 inspired)
export const SURFACE = '#f9f9f9';
export const SURFACE_LOW = '#f3f3f4';
export const SURFACE_CONTAINER = '#eeeeee';
export const SURFACE_HIGH = '#e8e8e8';

export type ChatTab = 'messages' | 'community';

export interface ProfileInfo {
  id?: string;
  name: string;
  image: string | null;
  designation: string | null;
  assigned_state: string | null;
  assigned_lga: string | null;
  assigned_ward: string | null;
  voting_state: string | null;
  voting_lga: string | null;
  voting_ward: string | null;
  voting_pu: string | null;
}

export interface RoomLevelStyle {
  badge: string;
  badgeText: string;
  avatar: string;
  avatarText: string;
}

export const ROOM_LEVEL_STYLES: Record<string, RoomLevelStyle> = {
  national: { badge: '#ffdada', badgeText: '#7b2c33', avatar: '#006837', avatarText: '#fff' },
  state:    { badge: '#dbeafe', badgeText: '#1e40af', avatar: '#c5e8cd', avatarText: '#006837' },
  lga:      { badge: '#ffedd5', badgeText: '#c2410c', avatar: '#e8e8e8', avatarText: '#3f4941' },
  ward:     { badge: '#f3e8ff', badgeText: '#7e22ce', avatar: '#e8e8e8', avatarText: '#3f4941' },
  pu:       { badge: '#dcfce7', badgeText: '#15803d', avatar: '#e8e8e8', avatarText: '#3f4941' },
};

// Backward compat: maps room level to its accent text color
export const ROOM_LEVEL_COLORS: Record<string, string> = {
  national: '#7b2c33',
  state: '#1e40af',
  lga: '#c2410c',
  ward: '#7e22ce',
  pu: '#15803d',
};
