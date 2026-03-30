import { useRef, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Chip, CircularProgress } from '@mui/material';
import { ArrowLeft, ChevronDown, Shield, Trash2, Users } from 'lucide-react';
import { FONT, PRIMARY, ROOM_LEVEL_STYLES, SURFACE_LOW } from '../types';
import { msgToProfile } from '../utils';
import type { ProfileInfo } from '../types';
import type { Room, RoomMessage } from '../../../../services/roomService';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ChatEmptyState from './ChatEmptyState';
import ContextMenuPopover from './ContextMenuPopover';
import { Megaphone, UserPlus } from 'lucide-react';

interface Props {
  room: Room | null;
  messages: RoomMessage[];
  loadingMessages: boolean;
  hasMore: boolean;
  roomInput: string;
  sendingRoom: boolean;
  roomSendError: string | null;
  myRoomRole: 'admin' | 'moderator' | 'member';
  profileId?: string;
  contextMenu: { anchorEl: HTMLElement; message: RoomMessage } | null;
  onBack: () => void;
  onSend: () => void;
  onInputChange: (v: string) => void;
  onLoadMore: () => void;
  onProfileClick: (p: ProfileInfo) => void;
  onCleanup: () => void;
  onContextMenu: (ctx: { anchorEl: HTMLElement; message: RoomMessage } | null) => void;
  onDeleteMsg: (id: string) => void;
  onPinMsg: (id: string) => void;
  onMuteUser: (id: string) => void;
  onBanUser: (id: string) => void;
}

export default function RoomChat({
  room,
  messages,
  loadingMessages,
  hasMore,
  roomInput,
  sendingRoom,
  roomSendError,
  myRoomRole,
  profileId,
  contextMenu,
  onBack,
  onSend,
  onInputChange,
  onLoadMore,
  onProfileClick,
  onCleanup,
  onContextMenu,
  onDeleteMsg,
  onPinMsg,
  onMuteUser,
  onBanUser,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!room) {
    return (
      <ChatEmptyState
        icon={<Users size={36} strokeWidth={1.5} />}
        title="Select a room to start chatting"
        subtitle="Join the conversation in your national, state, or local community rooms. Share updates, coordinate efforts, and build the movement."
        infoCards={[
          {
            icon: <Megaphone size={20} />,
            title: 'Stay Updated',
            description: 'Get the latest news from your ward leaders.',
          },
          {
            icon: <UserPlus size={20} />,
            title: 'Local Organizing',
            description: 'Connect with voters in your immediate polling unit.',
          },
        ]}
      />
    );
  }

  const style = ROOM_LEVEL_STYLES[room.room_level] || ROOM_LEVEL_STYLES.pu;
  const isAdmin = myRoomRole === 'admin';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 1.5, md: 2.5 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <IconButton onClick={onBack} sx={{ display: { xs: 'flex', md: 'none' }, p: 0.5 }}>
          <ArrowLeft size={20} color="#1a1c1c" />
        </IconButton>
        <Avatar
          variant="rounded"
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            bgcolor: style.avatar,
            color: style.avatarText,
            fontSize: '1.2rem',
            fontWeight: 700,
          }}
        >
          {room.icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#1a1c1c',
              lineHeight: 1.2,
            }}
          >
            {room.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
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
              }}
            />
            <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6f7a70' }}>
              {room.member_count} members
            </Typography>
            {isAdmin && (
              <Chip
                icon={<Shield size={10} />}
                label="Admin"
                size="small"
                sx={{
                  fontFamily: FONT,
                  fontSize: '0.56rem',
                  fontWeight: 700,
                  height: 18,
                  borderRadius: 1.5,
                  bgcolor: '#ffdada',
                  color: '#7b2c33',
                  '& .MuiChip-icon': { color: '#7b2c33' },
                }}
              />
            )}
          </Box>
        </Box>
        {isAdmin && (
          <IconButton
            onClick={onCleanup}
            size="small"
            title="Purge all messages"
            sx={{ color: '#ba1a1a', ml: 'auto' }}
          >
            <Trash2 size={18} />
          </IconButton>
        )}
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 1.5, md: 3 },
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: SURFACE_LOW,
        }}
      >
        {hasMore && (
          <Box sx={{ textAlign: 'center', mb: 1.5 }}>
            <Typography
              onClick={onLoadMore}
              sx={{
                fontFamily: FONT,
                fontSize: '0.78rem',
                color: PRIMARY,
                cursor: 'pointer',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} />
              Load earlier messages
            </Typography>
          </Box>
        )}

        {loadingMessages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: PRIMARY }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: FONT, color: '#bec9be', fontSize: '0.88rem' }}>
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender_id === profileId;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showSender = !isOwn && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
            const showDate =
              !prevMsg ||
              new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();
            const profile = msgToProfile(msg);
            const levelBadgeColor = style.badgeText;

            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                createdAt={msg.created_at}
                isOwn={isOwn}
                senderName={msg.sender_name}
                senderImage={msg.sender_image}
                senderDesignation={msg.sender_designation}
                senderProfile={profile}
                showAvatar={showSender}
                showDateSeparator={showDate}
                isPinned={msg.is_pinned}
                isDeleted={msg.is_deleted}
                accentColor={levelBadgeColor}
                onAvatarClick={() => onProfileClick(profile)}
                onContextMenu={(e) => {
                  if (msg.is_deleted) return;
                  const isOwnMsg = msg.sender_id === profileId;
                  if (!isAdmin && !isOwnMsg) return;
                  e.preventDefault();
                  onContextMenu({ anchorEl: e.currentTarget as HTMLElement, message: msg });
                }}
              />
            );
          })
        )}

        <div ref={endRef} />
      </Box>

      {/* Input */}
      <MessageInput
        value={roomInput}
        onChange={onInputChange}
        onSend={onSend}
        disabled={sendingRoom}
        error={roomSendError}
      />

      {/* Context menu */}
      <ContextMenuPopover
        anchorEl={contextMenu?.anchorEl || null}
        message={contextMenu?.message || null}
        isAdmin={isAdmin}
        currentUserId={profileId}
        onClose={() => onContextMenu(null)}
        onPin={onPinMsg}
        onDelete={onDeleteMsg}
        onMute={onMuteUser}
        onBan={onBanUser}
      />
    </Box>
  );
}
