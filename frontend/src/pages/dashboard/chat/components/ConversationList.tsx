import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Badge,
  InputAdornment,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Skeleton,
} from '@mui/material';
import { MessageSquare, Search, Plus, Circle } from 'lucide-react';
import { FONT, PRIMARY, PRIMARY_LIGHT, ACCENT, SURFACE_LOW } from '../types';
import { formatTime, richDesignation, convToProfile } from '../utils';
import ChatEmptyState from './ChatEmptyState';
import type { Conversation } from '../../../../services/conversationService';

interface Props {
  conversations: Conversation[];
  loading: boolean;
  activeConvId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

export default function ConversationList({
  conversations,
  loading,
  activeConvId,
  search,
  onSearchChange,
  onSelect,
  onNewChat,
  isConnected,
  onlineUsers,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  color: '#1a1c1c',
                  letterSpacing: '-0.02em',
                }}
              >
                Chats
              </Typography>
              {isConnected && <Circle size={7} fill={ACCENT} stroke={ACCENT} />}
            </Box>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#6f7a70', mt: 0.25 }}>
              Direct & Group
            </Typography>
          </Box>
          <IconButton
            onClick={onNewChat}
            size="small"
            sx={{
              bgcolor: PRIMARY_LIGHT,
              color: PRIMARY,
              width: 36,
              height: 36,
              '&:hover': { bgcolor: 'rgba(0,104,55,0.12)' },
            }}
          >
            <Plus size={18} />
          </IconButton>
        </Box>
        <TextField
          size="small"
          fullWidth
          placeholder="Search chats..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
              <Skeleton variant="circular" width={50} height={50} sx={{ borderRadius: 3 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="60%" height={20} />
                <Skeleton width="80%" height={16} />
              </Box>
            </Box>
          ))
        ) : conversations.length === 0 ? (
          <ChatEmptyState
            icon={<MessageSquare size={32} />}
            title={search ? 'No matching chats' : 'No conversations yet'}
            subtitle="Start a new chat with your coordinators or team members"
            action={
              !search ? (
                <Typography
                  onClick={onNewChat}
                  sx={{
                    fontFamily: FONT,
                    color: PRIMARY,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Start a new chat
                </Typography>
              ) : undefined
            }
          />
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            const isOnline = onlineUsers.has(conv.participant_id);
            const prof = convToProfile(conv);

            return (
              <ListItemButton
                key={conv.id}
                selected={isActive}
                onClick={() => onSelect(conv.id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  mx: 0.5,
                  gap: 1.5,
                  borderRadius: 2.5,
                  bgcolor: isActive ? PRIMARY_LIGHT : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: isActive ? PRIMARY_LIGHT : 'rgba(0,0,0,0.02)' },
                  '&.Mui-selected': { bgcolor: PRIMARY_LIGHT },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 'auto' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    invisible={!isOnline}
                    sx={{
                      '& .MuiBadge-dot': {
                        bgcolor: '#22c55e',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        border: '2px solid #fff',
                      },
                    }}
                  >
                    <Avatar
                      src={conv.participant_image || undefined}
                      imgProps={{ referrerPolicy: 'no-referrer' }}
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        bgcolor: '#546E7A',
                        fontFamily: FONT,
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      {conv.participant_name?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontFamily: FONT,
                            fontWeight: conv.unread_count > 0 ? 700 : 500,
                            fontSize: '0.88rem',
                            color: '#1a1c1c',
                          }}
                        >
                          {conv.participant_name}
                        </Typography>
                        {conv.participant_designation && (
                          <Typography
                            noWrap
                            sx={{
                              fontFamily: FONT,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              color: PRIMARY,
                              lineHeight: 1.2,
                            }}
                          >
                            {richDesignation(prof)}
                          </Typography>
                        )}
                      </Box>
                      {conv.last_message_at && (
                        <Typography
                          sx={{
                            fontFamily: FONT,
                            fontSize: '0.65rem',
                            color: conv.unread_count > 0 ? PRIMARY : '#bec9be',
                            fontWeight: conv.unread_count > 0 ? 600 : 400,
                            flexShrink: 0,
                            ml: 1,
                          }}
                        >
                          {formatTime(conv.last_message_at)}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.25 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: FONT,
                          fontSize: '0.78rem',
                          color: conv.unread_count > 0 ? '#3f4941' : '#bec9be',
                          fontWeight: conv.unread_count > 0 ? 500 : 400,
                          flex: 1,
                        }}
                      >
                        {conv.last_message_preview || 'No messages yet'}
                      </Typography>
                      {conv.unread_count > 0 && (
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
                            ml: 1,
                            flexShrink: 0,
                          }}
                        >
                          <Typography sx={{ fontFamily: FONT, fontSize: '0.62rem', fontWeight: 700 }}>
                            {conv.unread_count > 99 ? '99+' : conv.unread_count}
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
