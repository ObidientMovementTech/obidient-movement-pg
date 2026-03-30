import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  Divider,
} from '@mui/material';
import { FONT, PRIMARY, PRIMARY_LIGHT } from '../types';
import type { ChatContact } from '../../../../services/conversationService';

interface Props {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  coordinators: ChatContact[];
  subordinates: ChatContact[];
  onSelect: (participantId: string) => void;
}

export default function ContactsDialog({ open, onClose, loading, coordinators, subordinates, onSelect }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: '1.15rem',
          pb: 0.5,
          color: '#1a1c1c',
          letterSpacing: '-0.01em',
        }}
      >
        New Conversation
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress size={28} sx={{ color: PRIMARY }} />
          </Box>
        ) : (
          <>
            {coordinators.length > 0 && (
              <>
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#6f7a70',
                    mb: 1,
                    mt: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Your Coordinators
                </Typography>
                <List disablePadding>
                  {coordinators.map((c) => (
                    <ListItemButton
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      sx={{
                        borderRadius: 2.5,
                        mb: 0.5,
                        gap: 1.5,
                        py: 1.25,
                        '&:hover': { bgcolor: PRIMARY_LIGHT },
                      }}
                    >
                      <Avatar
                        src={c.profileImage || undefined}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: PRIMARY,
                          fontFamily: FONT,
                          fontWeight: 600,
                        }}
                      >
                        {c.name[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.9rem', color: '#1a1c1c' }}>
                          {c.name}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6f7a70' }}>
                          {c.designation}{c.level ? ` (${c.level})` : ''}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              </>
            )}

            {subordinates.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#6f7a70',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Coordinators in Your Jurisdiction
                </Typography>
                <List disablePadding sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {subordinates.map((c) => (
                    <ListItemButton
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      sx={{
                        borderRadius: 2.5,
                        mb: 0.5,
                        gap: 1.5,
                        py: 1.25,
                        '&:hover': { bgcolor: PRIMARY_LIGHT },
                      }}
                    >
                      <Avatar
                        src={c.profileImage || undefined}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: PRIMARY,
                          fontFamily: FONT,
                          fontWeight: 600,
                        }}
                      >
                        {c.name[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.9rem', color: '#1a1c1c' }}>
                          {c.name}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6f7a70' }}>
                          {c.designation}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              </>
            )}

            {coordinators.length === 0 && subordinates.length === 0 && (
              <Typography
                sx={{
                  fontFamily: FONT,
                  color: '#6f7a70',
                  textAlign: 'center',
                  py: 4,
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}
              >
                No contacts available. Complete your profile and location settings to see your coordinators.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
