import { Box, Typography, Avatar } from '@mui/material';
import { CheckCheck, Pin } from 'lucide-react';
import { FONT, PRIMARY } from '../types';
import { formatDateHeader, richDesignation } from '../utils';
import type { ProfileInfo } from '../types';
import type { MessageReaction } from '../../../../services/conversationService';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '🙏', '🔥'];

interface Props {
  content: string;
  createdAt: string;
  isOwn: boolean;
  senderName?: string;
  senderImage?: string | null;
  senderDesignation?: string | null;
  showAvatar?: boolean;
  showDateSeparator?: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  accentColor?: string;
  onAvatarClick?: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLElement>) => void;
  senderProfile?: ProfileInfo;
  // Reactions, replies, deletion
  reactions?: MessageReaction[];
  replyToSenderName?: string | null;
  replyToContent?: string | null;
  deletedAt?: string | null;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onDelete?: (mode: 'for_me' | 'for_everyone') => void;
}

export default function MessageBubble({
  content,
  createdAt,
  isOwn,
  senderName,
  senderImage,
  showAvatar,
  senderDesignation,
  showDateSeparator,
  isPinned,
  isDeleted,
  accentColor,
  onAvatarClick,
  onContextMenu,
  senderProfile,
  reactions,
  replyToSenderName,
  replyToContent,
  deletedAt,
  onReact,
  onReply: _onReply,
  onDelete: _onDelete,
}: Props) {
  const isDeletedMsg = isDeleted || !!deletedAt;
  const hasReactions = reactions && reactions.length > 0;

  const bubbleBg = isDeletedMsg
    ? 'rgba(0,0,0,0.02)'
    : isPinned
    ? '#FFFDE7'
    : isOwn
    ? PRIMARY
    : '#fff';

  const bubbleColor = isDeletedMsg ? '#999' : isOwn ? '#fff' : '#1a1c1c';
  const timeColor = isOwn ? 'rgba(255,255,255,0.6)' : '#bec9be';

  return (
    <Box>
      {showDateSeparator && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2.5 }}>
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#6f7a70',
              bgcolor: 'rgba(0,0,0,0.04)',
              px: 2,
              py: 0.5,
              borderRadius: 5,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {formatDateHeader(createdAt)}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          alignItems: 'flex-end',
          gap: 0.75,
          mb: hasReactions ? 1.5 : 0.4,
        }}
      >
        {!isOwn && (
          <Box sx={{ width: 32, flexShrink: 0 }}>
            {showAvatar && (
              <Avatar
                src={senderImage || undefined}
                onClick={onAvatarClick}
                imgProps={{ referrerPolicy: 'no-referrer' }}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: accentColor || '#546E7A',
                  cursor: onAvatarClick ? 'pointer' : 'default',
                  transition: 'transform 0.15s',
                  '&:hover': onAvatarClick ? { transform: 'scale(1.08)' } : {},
                }}
              >
                {senderName?.[0]?.toUpperCase()}
              </Avatar>
            )}
          </Box>
        )}

        <Box sx={{ position: 'relative', maxWidth: { xs: '85%', md: '58%' }, '&:hover .reaction-hover-bar': { display: 'flex' } }}>
          <Box
            onContextMenu={onContextMenu}
            sx={{
              bgcolor: bubbleBg,
              color: bubbleColor,
              borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              px: 2,
              py: 1,
              boxShadow: isOwn
                ? 'none'
                : '0 1px 2px rgba(0,0,0,0.04)',
              border: isPinned ? '1px solid #FFD54F' : 'none',
              fontStyle: isDeletedMsg ? 'italic' : 'normal',
              cursor: onContextMenu && !isDeletedMsg ? 'context-menu' : 'default',
              transition: 'background 0.15s',
            }}
          >
            {showAvatar && !isDeletedMsg && senderName && !isOwn && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.3 }}>
                <Typography
                  onClick={onAvatarClick}
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: accentColor || PRIMARY,
                    cursor: onAvatarClick ? 'pointer' : 'default',
                  }}
                >
                  {senderName}
                </Typography>
                {senderDesignation && senderDesignation !== 'Community Member' && senderProfile && (
                  <Typography
                    component="span"
                    sx={{ fontFamily: FONT, fontSize: '0.58rem', color: '#bec9be', fontWeight: 500 }}
                  >
                    {richDesignation(senderProfile)}
                  </Typography>
                )}
              </Box>
            )}

            {/* Inline reply preview */}
            {replyToSenderName && replyToContent && !isDeletedMsg && (
              <Box
                sx={{
                  borderLeft: `3px solid ${PRIMARY}`,
                  pl: 1,
                  py: 0.5,
                  mb: 0.5,
                  bgcolor: isOwn ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '0 6px 6px 0',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isOwn ? 'rgba(255,255,255,0.85)' : PRIMARY,
                  }}
                >
                  {replyToSenderName}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.72rem',
                    color: isOwn ? 'rgba(255,255,255,0.6)' : '#6f7a70',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 220,
                  }}
                >
                  {replyToContent}
                </Typography>
              </Box>
            )}

            {isPinned && !isDeletedMsg && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.2 }}>
                <Pin size={10} color="#FFC107" />
                <Typography sx={{ fontFamily: FONT, fontSize: '0.56rem', color: '#FFC107', fontWeight: 600 }}>
                  Pinned
                </Typography>
              </Box>
            )}

            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: '0.875rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {content}
            </Typography>

            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: '0.58rem',
                color: timeColor,
                textAlign: 'right',
                mt: 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.4,
              }}
            >
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isOwn && !isDeletedMsg && <CheckCheck size={12} style={{ opacity: 0.6 }} />}
            </Typography>
          </Box>

          {/* Reactions display */}
          {hasReactions && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -10,
                [isOwn ? 'right' : 'left']: 12,
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
              }}
            >
              {reactions.map((r) => (
                <Box
                  key={r.emoji}
                  onClick={() => onReact?.(r.emoji)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.3,
                    px: 0.75,
                    py: 0.2,
                    bgcolor: r.reacted ? 'rgba(0,104,55,0.08)' : '#fff',
                    border: `1px solid ${r.reacted ? PRIMARY : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: 5,
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'all 0.15s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                >
                  <span>{r.emoji}</span>
                  {r.count > 1 && (
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: FONT,
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        color: r.reacted ? PRIMARY : '#6f7a70',
                      }}
                    >
                      {r.count}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Quick reaction bar on hover (desktop) */}
          {!isDeletedMsg && onReact && (
            <Box
              className="reaction-hover-bar"
              sx={{
                position: 'absolute',
                top: -28,
                [isOwn ? 'right' : 'left']: 0,
                display: 'none',
                gap: 0.25,
                bgcolor: '#fff',
                borderRadius: 4,
                px: 0.5,
                py: 0.25,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                zIndex: 10,
              }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <Box
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  sx={{
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    p: 0.25,
                    borderRadius: 1,
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'scale(1.3)', bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
