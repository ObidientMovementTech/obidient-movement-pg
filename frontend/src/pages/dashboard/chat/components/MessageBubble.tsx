import { Box, Typography, Avatar } from '@mui/material';
import { CheckCheck, Pin } from 'lucide-react';
import { FONT, PRIMARY } from '../types';
import { formatDateHeader, richDesignation } from '../utils';
import type { ProfileInfo } from '../types';

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
}: Props) {
  const bubbleBg = isDeleted
    ? 'rgba(0,0,0,0.02)'
    : isPinned
    ? '#FFFDE7'
    : isOwn
    ? PRIMARY
    : '#fff';

  const bubbleColor = isDeleted ? '#999' : isOwn ? '#fff' : '#1a1c1c';
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
          mb: 0.4,
        }}
      >
        {!isOwn && (
          <Box sx={{ width: 32, flexShrink: 0 }}>
            {showAvatar && (
              <Avatar
                src={senderImage || undefined}
                onClick={onAvatarClick}
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

        <Box
          onContextMenu={onContextMenu}
          sx={{
            maxWidth: { xs: '85%', md: '58%' },
            bgcolor: bubbleBg,
            color: bubbleColor,
            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            px: 2,
            py: 1,
            boxShadow: isOwn
              ? 'none'
              : '0 1px 2px rgba(0,0,0,0.04)',
            border: isPinned ? '1px solid #FFD54F' : 'none',
            fontStyle: isDeleted ? 'italic' : 'normal',
            cursor: onContextMenu && !isDeleted ? 'context-menu' : 'default',
            transition: 'background 0.15s',
          }}
        >
          {showAvatar && !isDeleted && senderName && !isOwn && (
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

          {isPinned && !isDeleted && (
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
            {isOwn && !isDeleted && <CheckCheck size={12} style={{ opacity: 0.6 }} />}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
