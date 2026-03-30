import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
  Badge,
  Skeleton,
} from '@mui/material';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import {
  getInbox,
  replyToMessage,
  markAsRead,
  type ChatMessage,
} from '../../../services/chatService';

type Filter = 'all' | 'unread' | 'responded';

export default function ChatInboxPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChatMessage | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 10_000);
    return () => clearInterval(pollRef.current);
  }, []);

  async function loadMessages() {
    try {
      const res = await getInbox();
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Error loading inbox:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = messages.filter((m) => {
    if (filter === 'unread') return m.status !== 'responded' && m.status !== 'read';
    if (filter === 'responded') return m.status === 'responded';
    return true;
  });

  const unreadCount = messages.filter((m) => m.status !== 'responded' && m.status !== 'read').length;

  const handleSelect = async (msg: ChatMessage) => {
    setSelected(msg);
    setReply('');
    if (msg.status === 'pending' || msg.status === 'assigned' || msg.status === 'delivered') {
      await markAsRead(msg.id).catch(() => {});
      setMessages((prev: ChatMessage[]) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' as const } : m)),
      );
    }
  };

  const handleReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      await replyToMessage(selected.id, reply.trim());
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selected.id
            ? { ...m, status: 'responded' as const, response: reply.trim(), responded_at: new Date().toISOString() }
            : m,
        ),
      );
      setSelected((prev) =>
        prev ? { ...prev, status: 'responded', response: reply.trim(), responded_at: new Date().toISOString() } : null,
      );
      setReply('');
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>Chat Inbox</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Messages from members in your jurisdiction.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, height: { md: 'calc(100vh - 220px)' }, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left: Message list */}
        <Card sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 2, pt: 2 }}>
            <Tabs value={filter} onChange={(_, v) => setFilter(v)} variant="fullWidth" sx={{ minHeight: 36 }}>
              <Tab label="All" value="all" sx={{ minHeight: 36, fontSize: '0.8125rem' }} />
              <Tab
                label={<Badge badgeContent={unreadCount} color="error" max={99}>Unread</Badge>}
                value="unread"
                sx={{ minHeight: 36, fontSize: '0.8125rem' }}
              />
              <Tab label="Replied" value="responded" sx={{ minHeight: 36, fontSize: '0.8125rem' }} />
            </Tabs>
          </Box>
          <Divider />
          <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1.5 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
              ))
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <MessageSquare size={32} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                <Typography variant="body2" color="text.secondary">No messages</Typography>
              </Box>
            ) : (
              filtered.map((msg) => (
                <ListItemButton
                  key={msg.id}
                  selected={selected?.id === msg.id}
                  onClick={() => handleSelect(msg)}
                  sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
                      {msg.sender_name?.[0] || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: isUnread(msg) ? 600 : 400 }} noWrap>
                          {msg.sender_name || msg.sender_email || 'Member'}
                        </Typography>
                        <StatusDot status={msg.status} />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {msg.subject || msg.message.slice(0, 50)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </Card>

        {/* Right: Message detail */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selected ? (
            <>
              <CardContent sx={{ flex: 0 }}>
                <Button
                  size="small"
                  startIcon={<ArrowLeft size={16} />}
                  onClick={() => setSelected(null)}
                  sx={{ display: { md: 'none' }, mb: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    {selected.sender_name?.[0] || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {selected.sender_name || 'Member'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={selected.recipient_level} size="small" variant="outlined" />
                      {selected.recipient_location?.state && (
                        <Chip label={selected.recipient_location.state} size="small" variant="outlined" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(selected.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
              </CardContent>

              <CardContent sx={{ flex: 1, overflow: 'auto' }}>
                {selected.subject && (
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {selected.subject}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                  {selected.message}
                </Typography>

                {selected.response && (
                  <Box sx={{ bgcolor: 'primary.light', borderRadius: 2, p: 2, mt: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                      Your Response
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                      {selected.response}
                    </Typography>
                    {selected.responded_at && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(selected.responded_at).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>

              {/* Reply input */}
              {selected.status !== 'responded' && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                    multiline
                    maxRows={4}
                  />
                  <Button
                    variant="contained"
                    onClick={handleReply}
                    disabled={!reply.trim() || sending}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <Send size={18} />
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
              <MessageSquare size={40} style={{ color: '#94a3b8' }} />
              <Typography variant="body2" color="text.secondary">
                Select a message to view
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}

function isUnread(msg: ChatMessage) {
  return msg.status === 'pending' || msg.status === 'assigned' || msg.status === 'delivered';
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    assigned: '#3b82f6',
    delivered: '#3b82f6',
    read: '#94a3b8',
    responded: '#22c55e',
  };
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: colors[status] || '#94a3b8',
        flexShrink: 0,
      }}
    />
  );
}
