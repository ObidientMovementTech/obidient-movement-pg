import { useRef, useEffect } from 'react';
import { Box, Typography, Avatar, Badge, IconButton, Chip, CircularProgress } from '@mui/material';
import { ArrowLeft, ChevronDown, MessageSquare } from 'lucide-react';
import { FONT, PRIMARY, PRIMARY_LIGHT, SURFACE_LOW } from '../types';
import { richDesignation, convToProfile } from '../utils';
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
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

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
      <MessageInput value={messageInput} onChange={onInputChange} onSend={onSend} disabled={sending} />
    </Box>
  );
}
