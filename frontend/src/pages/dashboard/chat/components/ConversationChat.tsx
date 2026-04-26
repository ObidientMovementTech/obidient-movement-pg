import { useRef, useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Badge, IconButton, Chip, CircularProgress,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import { ArrowLeft, ChevronDown, MessageSquare, MoreVertical, Ban } from 'lucide-react';
import { FONT, PRIMARY, PRIMARY_LIGHT, SURFACE_LOW } from '../types';
import { richDesignation, convToProfile } from '../utils';
import { useBlock } from '../../../../context/BlockContext';
import type { ProfileInfo } from '../types';
import type { Conversation, Message } from '../../../../services/conversationService';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ChatEmptyState from './ChatEmptyState';

interface Props {
  conversation: Conversation | null;
  messages: Message[];
  loadingMessages: boolean;
  hasMore: boolean;
  messageInput: string;
  sending: boolean;
  typingText: string | null;
  onlineUsers: Set<string>;
  profileId?: string;
  onBack: () => void;
  onSend: () => void;
  onInputChange: (v: string) => void;
  onLoadMore: () => void;
  onProfileClick: (p: ProfileInfo) => void;
  // Reactions, replies, deletion
  replyingTo?: Message | null;
  onReply?: (msg: Message) => void;
  onCancelReply?: () => void;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string, mode: 'for_me' | 'for_everyone') => void;
}

export default function ConversationChat({
  conversation,
  messages,
  loadingMessages,
  hasMore,
  messageInput,
  sending,
  typingText,
  onlineUsers,
  profileId,
  onBack,
  onSend,
  onInputChange,
  onLoadMore,
  onProfileClick,
  replyingTo,
  onReply,
  onCancelReply,
  onReact,
  onDelete,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const { isBlocked, blockUser, unblockUser } = useBlock();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const blocked = conversation ? isBlocked(conversation.participant_id) : false;

  const handleBlock = async () => {
    if (!conversation) return;
    setBlockLoading(true);
    try {
      if (blocked) {
        await unblockUser(conversation.participant_id);
      } else {
        await blockUser(conversation.participant_id);
      }
    } catch { /* silent */ }
    setBlockLoading(false);
    setConfirmOpen(false);
    setMenuAnchor(null);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <ChatEmptyState
        icon={<MessageSquare size={36} strokeWidth={1.5} />}
        title="Select a conversation"
        subtitle="Choose a chat from the sidebar to start messaging"
      />
    );
  }

  const isOnline = onlineUsers.has(conversation.participant_id);
  const prof = convToProfile(conversation);

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
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          invisible={!isOnline}
          sx={{
            cursor: 'pointer',
            '& .MuiBadge-dot': {
              bgcolor: '#22c55e',
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: '2px solid #fff',
            },
          }}
          onClick={() => onProfileClick(prof)}
        >
          <Avatar
            src={conversation.participant_image || undefined}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: '#546E7A',
              fontFamily: FONT,
            }}
          >
            {conversation.participant_name?.[0]?.toUpperCase()}
          </Avatar>
        </Badge>
        <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => onProfileClick(prof)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#1a1c1c',
                lineHeight: 1.2,
              }}
            >
              {conversation.participant_name}
            </Typography>
            {conversation.participant_designation && (
              <Chip
                label={richDesignation(prof)}
                size="small"
                sx={{
                  fontFamily: FONT,
                  fontSize: '0.56rem',
                  fontWeight: 700,
                  height: 20,
                  bgcolor: PRIMARY_LIGHT,
                  color: PRIMARY,
                  borderRadius: 1.5,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: '0.72rem',
              color: typingText ? PRIMARY : '#6f7a70',
              fontWeight: typingText ? 500 : 400,
            }}
          >
            {typingText || (isOnline ? 'Active now' : '')}
          </Typography>
        </Box>

        {/* Block menu */}
        <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVertical size={18} color="#6f7a70" />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{ sx: { borderRadius: 3, minWidth: 160, fontFamily: FONT } }}
        >
          <MenuItem
            onClick={() => { setMenuAnchor(null); blocked ? handleBlock() : setConfirmOpen(true); }}
            sx={{ fontFamily: FONT, fontSize: '0.82rem', gap: 1, color: blocked ? '#737373' : '#ef4444' }}
          >
            <Ban size={15} />
            {blocked ? 'Unblock' : 'Block User'}
          </MenuItem>
        </Menu>
      </Box>

      {/* Blocked banner */}
      {blocked && (
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#fef2f2',
            borderBottom: '1px solid rgba(239,68,68,0.1)',
          }}
        >
          <Ban size={14} color="#ef4444" />
          <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#ef4444', flex: 1 }}>
            You blocked this user. They can't send you messages.
          </Typography>
          <Typography
            onClick={handleBlock}
            sx={{
              fontFamily: FONT,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: PRIMARY,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Unblock
          </Typography>
        </Box>
      )}

      {/* Block confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem' }}>
          Block {conversation?.participant_name}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: FONT, fontSize: '0.85rem' }}>
            They won't be able to send you direct messages. You can unblock them anytime.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={{ fontFamily: FONT, textTransform: 'none', color: '#737373' }}>
            Cancel
          </Button>
          <Button
            onClick={handleBlock}
            variant="contained"
            disabled={blockLoading}
            sx={{ fontFamily: FONT, textTransform: 'none', bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
          >
            {blockLoading ? 'Blocking…' : 'Block'}
          </Button>
        </DialogActions>
      </Dialog>

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
              No messages yet. Say hello!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender_id === profileId;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showAvatar = !isOwn && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
            const showDate =
              !prevMsg ||
              new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                createdAt={msg.created_at}
                isOwn={isOwn}
                senderName={msg.sender_name}
                senderImage={msg.sender_image}
                showAvatar={showAvatar}
                showDateSeparator={showDate}
                reactions={msg.reactions}
                replyToSenderName={msg.reply_to_sender_name}
                replyToContent={msg.reply_to_content}
                deletedAt={msg.deleted_at}
                onReact={onReact ? (emoji) => onReact(msg.id, emoji) : undefined}
                onReply={onReply ? () => onReply(msg) : undefined}
                onDelete={onDelete ? (mode) => onDelete(msg.id, mode) : undefined}
                onContextMenu={
                  !msg.deleted_at && onReply
                    ? (e) => {
                        e.preventDefault();
                        onReply(msg);
                      }
                    : undefined
                }
              />
            );
          })
        )}

        {/* Typing indicator */}
        {typingText && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 5 }}>
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: '16px 16px 16px 4px',
                px: 1.75,
                py: 0.75,
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#bec9be',
                      animation: 'typingBounce 1.4s infinite',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes typingBounce': {
                        '0%, 60%, 100%': { transform: 'translateY(0)' },
                        '30%': { transform: 'translateY(-4px)' },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        <div ref={endRef} />
      </Box>

      {/* Input */}
      <MessageInput
        value={messageInput}
        onChange={onInputChange}
        onSend={onSend}
        disabled={sending}
        replyTo={
          replyingTo
            ? { senderName: replyingTo.sender_name, content: replyingTo.content }
            : null
        }
        onCancelReply={onCancelReply}
      />
    </Box>
  );
}
