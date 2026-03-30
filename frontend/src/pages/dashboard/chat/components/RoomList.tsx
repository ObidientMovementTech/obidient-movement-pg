import {
  Box,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Users, Circle, Search, ChevronRight } from 'lucide-react';
import { FONT, PRIMARY, PRIMARY_LIGHT, ACCENT, ROOM_LEVEL_STYLES, SURFACE_LOW } from '../types';

import ChatEmptyState from './ChatEmptyState';
import type { Room } from '../../../../services/roomService';

interface Props {
  rooms: Room[];
  loading: boolean;
  activeRoomId: string | null;
  isConnected: boolean;
  onSelect: (id: string) => void;
}

export default function RoomList({ rooms, loading, activeRoomId, isConnected, onSelect }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '1.35rem',
              color: '#1a1c1c',
              letterSpacing: '-0.02em',
            }}
          >
            Community Rooms
          </Typography>
          {isConnected && <Circle size={7} fill={ACCENT} stroke={ACCENT} />}
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#6f7a70', mb: 2 }}>
          Join the conversation in your local blocs
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Search rooms..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#6f7a70" />
              </InputAdornment>
            ),
            sx: {
              fontFamily: FONT,
              fontSize: '0.85rem',
              borderRadius: 6,
              bgcolor: SURFACE_LOW,
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
              '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
            },
          }}
        />
      </Box>

      {/* List */}
      <List sx={{ flex: 1, overflowY: 'auto', px: 0.5, pt: 0 }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
              <Skeleton variant="rounded" width={50} height={50} sx={{ borderRadius: 3 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="60%" height={20} />
                <Skeleton width="40%" height={16} />
              </Box>
            </Box>
          ))
        ) : rooms.length === 0 ? (
          <ChatEmptyState
            icon={<Users size={32} />}
            title="No rooms available"
            subtitle="Complete your voting location to join rooms"
          />
        ) : (
          rooms.map((room) => {
            const isActive = room.id === activeRoomId;
            const style = ROOM_LEVEL_STYLES[room.room_level] || ROOM_LEVEL_STYLES.pu;

            return (
              <ListItemButton
                key={room.id}
                selected={isActive}
                onClick={() => onSelect(room.id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  mx: 0.5,
                  gap: 1.5,
                  borderRadius: 2.5,
                  bgcolor: isActive ? PRIMARY_LIGHT : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: isActive ? PRIMARY_LIGHT : 'rgba(0,104,55,0.03)' },
                  '&.Mui-selected': { bgcolor: PRIMARY_LIGHT },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 'auto' }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 3,
                      bgcolor: style.avatar,
                      color: style.avatarText,
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      boxShadow: room.room_level === 'national'
                        ? '0 4px 12px rgba(0,104,55,0.15)'
                        : 'none',
                    }}
                  >
                    {room.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontFamily: FONT,
                            fontWeight: room.unread_count > 0 ? 700 : 600,
                            fontSize: '0.88rem',
                            color: '#1a1c1c',
                          }}
                        >
                          {room.title}
                        </Typography>
                        <Chip
                          label={room.room_level.toUpperCase()}
                          size="small"
                          sx={{
                            fontFamily: FONT,
                            fontSize: '0.52rem',
                            fontWeight: 800,
                            height: 18,
                            borderRadius: 1.5,
                            bgcolor: style.badge,
                            color: style.badgeText,
                            letterSpacing: '0.05em',
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                      <ChevronRight size={16} color="#bec9be" style={{ flexShrink: 0 }} />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Users size={12} color="#bec9be" />
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: '#6f7a70' }}>
                          {room.member_count >= 1000
                            ? `${(room.member_count / 1000).toFixed(room.member_count >= 10000 ? 0 : 1)}k`
                            : room.member_count}{' '}
                          members
                        </Typography>
                      </Box>
                      {room.unread_count > 0 && (
                        <Box
                          sx={{
                            bgcolor: PRIMARY,
                            color: '#fff',
                            borderRadius: 10,
                            minWidth: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 0.75,
                            flexShrink: 0,
                          }}
                        >
                          <Typography sx={{ fontFamily: FONT, fontSize: '0.62rem', fontWeight: 700 }}>
                            {room.unread_count > 99 ? '99+' : room.unread_count}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                  disableTypography
                />
              </ListItemButton>
            );
          })
        )}
      </List>
    </Box>
  );
}
