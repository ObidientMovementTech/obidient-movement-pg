import { Menu, MenuItem, Divider } from '@mui/material';
import { Pin, Trash2, VolumeX, Ban } from 'lucide-react';
import { FONT, PRIMARY } from '../types';
import type { RoomMessage } from '../../../../services/roomService';

interface Props {
  anchorEl: HTMLElement | null;
  message: RoomMessage | null;
  isAdmin: boolean;
  currentUserId?: string;
  onClose: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onMute: (userId: string) => void;
  onBan: (userId: string) => void;
}

export default function ContextMenuPopover({
  anchorEl,
  message,
  isAdmin,
  currentUserId,
  onClose,
  onPin,
  onDelete,
  onMute,
  onBan,
}: Props) {
  if (!message) return null;

  const isOwnMsg = message.sender_id === currentUserId;

  const menuItemSx = {
    fontFamily: FONT,
    fontSize: '0.84rem',
    py: 1,
    px: 2,
    gap: 1.25,
    borderRadius: 1.5,
    mx: 0.5,
    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
  };

  return (
    <Menu
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 180,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          py: 0.5,
        },
      }}
    >
      {isAdmin && (
        <MenuItem onClick={() => onPin(message.id)} sx={menuItemSx}>
          <Pin size={15} color={PRIMARY} />
          {message.is_pinned ? 'Unpin' : 'Pin'}
        </MenuItem>
      )}
      <MenuItem
        onClick={() => onDelete(message.id)}
        sx={{ ...menuItemSx, color: '#ba1a1a' }}
      >
        <Trash2 size={15} />
        Delete
      </MenuItem>
      {isAdmin && !isOwnMsg && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => onMute(message.sender_id)} sx={menuItemSx}>
            <VolumeX size={15} />
            Mute 1 hour
          </MenuItem>
          <MenuItem
            onClick={() => onBan(message.sender_id)}
            sx={{ ...menuItemSx, color: '#ba1a1a' }}
          >
            <Ban size={15} />
            Ban from room
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
