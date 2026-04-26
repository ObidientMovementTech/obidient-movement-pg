import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Fab,
  Badge,
  Paper,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Slide,
  CircularProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  MessageSquare,
  X,
  ArrowLeft,
  Send,
  Plus,
  Search,
  Circle,
  ChevronDown,
  CheckCheck,
  Maximize2,
  Users,
  MoreVertical,
  Ban,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useUser } from '../../context/UserContext';
import { useBlock } from '../../context/BlockContext';
import { useSocket, type ChatMessage as SocketChatMessage, type TypingEvent, type ReactionUpdateEvent, type MessageDeletedEvent } from '../../context/SocketContext';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage as apiSendMessage,
  getChatContacts,
  type Conversation,
  type Message,
  type ChatContact,
} from '../../services/conversationService';
import {
  getMyRooms,
  getRoomMessages,
  sendRoomMessage as apiSendRoomMessage,
  type Room,
  type RoomMessage,
} from '../../services/roomService';

const FONT = '"Poppins", sans-serif';
const PRIMARY = '#0B6739';
const ACCENT = '#8cc63f';

type WidgetView = 'conversations' | 'chat' | 'contacts' | 'rooms' | 'roomChat';

/** Build a rich designation string: "LGA Coordinator — Ikeja, Lagos" */
function richDesignation(conv: Conversation): string {
  const d = conv.participant_designation;
  if (!d) return '';
  const parts: string[] = [];
  if (conv.participant_assigned_ward) parts.push(conv.participant_assigned_ward);
  if (conv.participant_assigned_lga) parts.push(conv.participant_assigned_lga);
  if (conv.participant_assigned_state) parts.push(conv.participant_assigned_state);
  if (parts.length === 0) return d;
  return `${d} — ${parts.join(', ')}`;
}

const ROOM_LEVEL_COLORS: Record<string, string> = {
  national: '#1565C0',
  state: '#2E7D32',
  lga: '#6A1B9A',
  ward: '#E65100',
  pu: '#C62828',
};

export default function ChatWidget() {
  const { profile } = useUser();
  const { isBlocked, blockUser: doBlock, unblockUser: doUnblock } = useBlock();
  const navigate = useNavigate();
  const {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    startTyping: emitStartTyping,
    stopTyping: emitStopTyping,
  } = useSocket();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<WidgetView>('conversations');

  // Conversation list state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [search, setSearch] = useState('');

  // Active chat state
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Contacts state
  const [contacts, setContacts] = useState<{ coordinators: ChatContact[]; subordinates: ChatContact[] }>({
    coordinators: [],
    subordinates: [],
  });
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [pendingParticipant, setPendingParticipant] = useState<ChatContact | null>(null);

  // Room state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [loadingRoomMsgs, setLoadingRoomMsgs] = useState(false);
  const [hasMoreRoomMsgs, setHasMoreRoomMsgs] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [sendingRoom, setSendingRoom] = useState(false);
  const [roomSendError, setRoomSendError] = useState<string | null>(null);
  // Mini tab: 'chats' or 'rooms'
  const [listTab, setListTab] = useState<'chats' | 'rooms'>('chats');

  // Block UI state
  const [blockMenuAnchor, setBlockMenuAnchor] = useState<HTMLElement | null>(null);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomMessagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const location = useLocation();
  const isOnChatPage = location.pathname === '/dashboard/chat';
  const isVisible = Boolean(profile?.emailVerified) && !isOnChatPage;

  // ──── Active conversation data ────────────
  const activeConversation = useMemo(() => {
    if (activeConvId) return conversations.find((c) => c.id === activeConvId) ?? null;
    if (pendingParticipant) {
      return {
        id: 'pending',
        type: 'direct' as const,
        last_message_at: null,
        last_message_preview: null,
        created_at: new Date().toISOString(),
        unread_count: 0,
        last_read_at: null,
        participant_id: pendingParticipant.id,
        participant_name: pendingParticipant.name,
        participant_email: pendingParticipant.email,
        participant_image: pendingParticipant.profileImage,
        participant_designation: pendingParticipant.designation,
        participant_assigned_state: null,
        participant_assigned_lga: null,
        participant_assigned_ward: null,
        participant_voting_state: null,
        participant_voting_lga: null,
        participant_voting_ward: null,
        participant_voting_pu: null,
      } satisfies Conversation;
    }
    return null;
  }, [conversations, activeConvId, pendingParticipant]);

  // ──── Total unread ────────────────────────
  const totalUnread = useMemo(
    () => {
      const convUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      const roomUnread = rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0);
      return convUnread + roomUnread;
    },
    [conversations, rooms]
  );

  // ──── Block status for active DM ─────────
  const isActiveBlocked = activeConversation ? isBlocked(activeConversation.participant_id) : false;

  const handleWidgetBlock = async () => {
    if (!activeConversation) return;
    setBlockLoading(true);
    try {
      if (isActiveBlocked) {
        await doUnblock(activeConversation.participant_id);
      } else {
        await doBlock(activeConversation.participant_id);
      }
    } catch { /* silent */ }
    setBlockLoading(false);
    setBlockConfirmOpen(false);
    setBlockMenuAnchor(null);
  };

  // ──── Load conversations ──────────────────
  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations(1, 50);
      setConversations(data.conversations || []);
    } catch {
      // silent
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    setLoadingConvos(true);
    loadConversations();
    pollRef.current = setInterval(loadConversations, 30_000);
    return () => clearInterval(pollRef.current);
  }, [isVisible, loadConversations]);

  // ──── Load messages when conv changes ─────
  useEffect(() => {
    if (!activeConvId) return;
    let cancelled = false;

    const load = async () => {
      setLoadingMessages(true);
      try {
        const data = await getMessages(activeConvId);
        if (!cancelled) {
          setMessages(data.messages);
          setHasMoreMessages(data.hasMore);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    load();
    joinConversation(activeConvId);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, unread_count: 0 } : c))
    );

    return () => {
      cancelled = true;
      leaveConversation(activeConvId);
    };
  }, [activeConvId, joinConversation, leaveConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ──── Socket listeners ─────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: SocketChatMessage) => {
      if (msg.conversation_id === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id,
            content: msg.content,
            message_type: msg.message_type,
            created_at: msg.created_at,
            edited_at: null,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            sender_image: msg.sender_image,
            reply_to_id: msg.reply_to_id ?? null,
            reply_to_content: msg.reply_to_content ?? null,
            reply_to_sender_name: msg.reply_to_sender_name ?? null,
            reply_to_sender_id: msg.reply_to_sender_id ?? null,
            reactions: msg.reactions ?? [],
            deleted_at: msg.deleted_at ?? null,
          }];
        });
      }

      // Update sidebar
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.conversation_id);
        if (idx === -1) {
          loadConversations();
          return prev;
        }
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          last_message_at: msg.created_at,
          last_message_preview:
            msg.content.length > 100 ? msg.content.slice(0, 100) + '...' : msg.content,
          unread_count:
            msg.conversation_id === activeConvId
              ? 0
              : updated[idx].unread_count + (msg.sender_id !== profile?._id ? 1 : 0),
        };
        const [item] = updated.splice(idx, 1);
        updated.unshift(item);
        return updated;
      });
    };

    const handleConvCreated = () => loadConversations();

    const handleTypingStart = (data: TypingEvent) => {
      if (data.userId === profile?._id) return;
      setTypingUsers((prev) => new Map(prev).set(data.userId, data.name));
    };

    const handleTypingStop = (data: TypingEvent) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:created', handleConvCreated);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    const handleReactionUpdated = (data: ReactionUpdateEvent) => {
      if (data.conversationId !== activeConvId) return;
      setMessages((prev) =>
        prev.map((m) => m.id === data.messageId ? { ...m, reactions: data.reactions } : m)
      );
    };

    const handleMessageDeleted = (data: MessageDeletedEvent) => {
      if (data.conversationId !== activeConvId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, deleted_at: new Date().toISOString(), content: 'This message was deleted' }
            : m
        )
      );
    };

    socket.on('reaction:updated', handleReactionUpdated);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:created', handleConvCreated);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('reaction:updated', handleReactionUpdated);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, activeConvId, profile?._id, loadConversations]);

  // ──── Load rooms (once, on mount) ─────────
  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    const load = async () => {
      setLoadingRooms(true);
      try {
        const data = await getMyRooms();
        if (!cancelled) setRooms(data.rooms || []);
      } catch { /* silent */ }
      finally { if (!cancelled) setLoadingRooms(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [isVisible]);

  // ──── Load room messages ──────────────────
  useEffect(() => {
    if (!activeRoomId) return;
    let cancelled = false;
    const load = async () => {
      setLoadingRoomMsgs(true);
      setRoomSendError(null);
      try {
        const data = await getRoomMessages(activeRoomId);
        if (!cancelled) {
          setRoomMessages(data.messages);
          setHasMoreRoomMsgs(data.hasMore);
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoadingRoomMsgs(false); }
    };
    load();
    socket?.emit('room:join', activeRoomId);
    return () => {
      cancelled = true;
      socket?.emit('room:leave', activeRoomId);
    };
  }, [activeRoomId, socket]);

  // Auto-scroll room messages
  useEffect(() => {
    roomMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  // ──── Room socket listeners ────────────────
  useEffect(() => {
    if (!socket) return;
    const handleRoomMsg = (msg: RoomMessage & { conversation_id: string }) => {
      if (msg.conversation_id === activeRoomId) {
        setRoomMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      setRooms(prev => prev.map(r => {
        if (r.id !== msg.conversation_id) return r;
        return {
          ...r,
          last_message_at: msg.created_at,
          last_message_preview: msg.content.length > 100 ? msg.content.slice(0, 100) + '...' : msg.content,
          unread_count: msg.conversation_id === activeRoomId ? 0 : r.unread_count + 1,
        };
      }));
    };
    const handleRoomDeleted = (data: { roomId: string; messageId: string }) => {
      if (data.roomId === activeRoomId) {
        setRoomMessages(prev => prev.map(m =>
          m.id === data.messageId ? { ...m, is_deleted: true, content: '[Message deleted]' } : m
        ));
      }
    };
    socket.on('room:message:new', handleRoomMsg);
    socket.on('room:message:deleted', handleRoomDeleted);
    return () => {
      socket.off('room:message:new', handleRoomMsg);
      socket.off('room:message:deleted', handleRoomDeleted);
    };
  }, [socket, activeRoomId]);

  // ──── Actions ──────────────────────────────
  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || sending) return;
    if (!activeConvId && !pendingParticipant) return;

    setMessageInput('');
    setSending(true);

    try {
      let convId = activeConvId;

      // Lazy creation: create conversation on first message send
      if (!convId && pendingParticipant) {
        const createData = await getOrCreateConversation(pendingParticipant.id);
        convId = createData.conversationId;
        setActiveConvId(convId);
        setPendingParticipant(null);
        joinConversation(convId!);
      }

      if (!convId) return;

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      emitStopTyping(convId);

      const data = await apiSendMessage(convId, content);
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, {
            id: data.message.id,
            content: data.message.content,
            message_type: data.message.message_type,
            created_at: data.message.created_at,
            edited_at: null,
            sender_id: data.message.sender_id,
            sender_name: data.message.sender_name,
            sender_image: data.message.sender_image,
            reply_to_id: data.message.reply_to_id ?? null,
            reply_to_content: data.message.reply_to_content ?? null,
            reply_to_sender_name: data.message.reply_to_sender_name ?? null,
            reply_to_sender_id: data.message.reply_to_sender_id ?? null,
            reactions: data.message.reactions ?? [],
            deleted_at: data.message.deleted_at ?? null,
          }];
        });
        await loadConversations();
      }
    } catch {
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!activeConvId) return;
    emitStartTyping(activeConvId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitStopTyping(activeConvId), 3000);
  };

  const openChat = (convId: string) => {
    setActiveConvId(convId);
    setView('chat');
  };

  const goBack = () => {
    setActiveConvId(null);
    setPendingParticipant(null);
    setMessages([]);
    setTypingUsers(new Map());
    setView('conversations');
  };

  const openContacts = async () => {
    setView('contacts');
    setLoadingContacts(true);
    try {
      const data = await getChatContacts();
      setContacts({ coordinators: data.coordinators, subordinates: data.subordinates });
    } catch {
      // silent
    } finally {
      setLoadingContacts(false);
    }
  };

  const startConversation = (participantId: string) => {
    // Check local conversations first
    const existing = conversations.find((c) => c.participant_id === participantId);
    if (existing) {
      setActiveConvId(existing.id);
      setPendingParticipant(null);
      setView('chat');
    } else {
      const allContacts = [...contacts.coordinators, ...contacts.subordinates];
      const contact = allContacts.find((c) => c.id === participantId);
      setPendingParticipant(contact ?? { id: participantId, name: 'User', email: '', phone: null, profileImage: null, designation: '' });
      setActiveConvId(null);
      setMessages([]);
      setView('chat');
    }
  };

  const handleLoadMore = async () => {
    if (!activeConvId || !hasMoreMessages || messages.length === 0) return;
    const data = await getMessages(activeConvId, { before: messages[0].created_at });
    setMessages((prev) => [...data.messages, ...prev]);
    setHasMoreMessages(data.hasMore);
  };

  // Room actions
  const openRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setView('roomChat');
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unread_count: 0 } : r));
  };

  const goBackFromRoom = () => {
    setActiveRoomId(null);
    setRoomMessages([]);
    setRoomSendError(null);
    setView('rooms');
  };

  const handleSendRoomMsg = async () => {
    if (!activeRoomId || !roomInput.trim() || sendingRoom) return;
    const content = roomInput.trim();
    setRoomInput('');
    setSendingRoom(true);
    setRoomSendError(null);
    try {
      const data = await apiSendRoomMessage(activeRoomId, content);
      if (data.message) {
        setRoomMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err: any) {
      setRoomSendError(err?.response?.data?.message || 'Failed to send');
      setRoomInput(content);
      setTimeout(() => setRoomSendError(null), 5000);
    } finally {
      setSendingRoom(false);
    }
  };

  const handleRoomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendRoomMsg(); }
  };

  const handleRoomLoadMore = async () => {
    if (!activeRoomId || !hasMoreRoomMsgs || roomMessages.length === 0) return;
    const data = await getRoomMessages(activeRoomId, { before: roomMessages[0].created_at });
    setRoomMessages(prev => [...data.messages, ...prev]);
    setHasMoreRoomMsgs(data.hasMore);
  };

  const activeRoom = useMemo(
    () => rooms.find(r => r.id === activeRoomId) ?? null,
    [rooms, activeRoomId]
  );

  // ──── Helpers ──────────────────────────────
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.participant_name?.toLowerCase().includes(q));
  }, [conversations, search]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const typingText = useMemo(() => {
    const names = Array.from(typingUsers.values());
    if (names.length === 0) return null;
    return names.length === 1 ? `${names[0]} is typing...` : `${names.join(', ')} are typing...`;
  }, [typingUsers]);

  if (!isVisible) return null;

  // ═════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════
  return (
    <>
      {/* FAB */}
      <Fab
        color="primary"
        onClick={() => setOpen((v) => !v)}
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 24 },
          right: 24,
          zIndex: 1300,
          width: 56,
          height: 56,
          bgcolor: PRIMARY,
          '&:hover': { bgcolor: '#084a29' },
        }}
      >
        <Badge badgeContent={totalUnread} color="error" max={99}>
          {open ? <X size={22} /> : <MessageSquare size={22} />}
        </Badge>
      </Fab>

      {/* Chat Panel */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 148, md: 92 },
            right: 24,
            zIndex: 1300,
            width: { xs: 'calc(100% - 48px)', sm: 380 },
            height: 520,
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ─── Header ─── */}
          <Box
            sx={{
              bgcolor: PRIMARY,
              color: '#fff',
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 48,
            }}
          >
            {(view === 'chat' || view === 'contacts' || view === 'roomChat') && (
              <IconButton size="small" onClick={view === 'roomChat' ? goBackFromRoom : goBack} sx={{ color: '#fff', p: 0.5 }}>
                <ArrowLeft size={18} />
              </IconButton>
            )}

            {(view === 'conversations' || view === 'rooms') && (
              <>
                {view === 'conversations' ? <MessageSquare size={18} /> : <Users size={18} />}
                <Typography sx={{ flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: '0.9rem' }}>
                  {view === 'conversations' ? 'Chats' : 'Rooms'}
                </Typography>
                {isConnected && <Circle size={8} fill={ACCENT} stroke={ACCENT} />}
                {view === 'conversations' && (
                  <IconButton size="small" onClick={openContacts} sx={{ color: '#fff', p: 0.5 }}>
                    <Plus size={18} />
                  </IconButton>
                )}
              </>
            )}

            {view === 'chat' && activeConversation && (
              <>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  invisible={!onlineUsers.has(activeConversation.participant_id)}
                  sx={{ '& .MuiBadge-dot': { bgcolor: ACCENT, width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #fff' } }}
                >
                  <Avatar
                    src={activeConversation.participant_image || undefined}
                    imgProps={{ referrerPolicy: 'no-referrer' }}
                    sx={{ width: 32, height: 32, bgcolor: '#fff', color: PRIMARY, fontSize: '0.75rem', fontFamily: FONT }}
                  >
                    {activeConversation.participant_name?.[0]?.toUpperCase()}
                  </Avatar>
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                    {activeConversation.participant_name}
                  </Typography>
                  <Typography noWrap sx={{ fontFamily: FONT, fontSize: '0.65rem', opacity: 0.8 }}>
                    {typingText || (onlineUsers.has(activeConversation.participant_id) ? 'Online' : richDesignation(activeConversation))}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={(e) => setBlockMenuAnchor(e.currentTarget)} sx={{ color: '#fff', p: 0.3 }}>
                  <MoreVertical size={16} />
                </IconButton>
                <Menu
                  anchorEl={blockMenuAnchor}
                  open={Boolean(blockMenuAnchor)}
                  onClose={() => setBlockMenuAnchor(null)}
                  PaperProps={{ sx: { borderRadius: 2, minWidth: 140, fontFamily: FONT } }}
                >
                  <MenuItem
                    onClick={() => { setBlockMenuAnchor(null); isActiveBlocked ? handleWidgetBlock() : setBlockConfirmOpen(true); }}
                    sx={{ fontFamily: FONT, fontSize: '0.78rem', gap: 0.75, color: isActiveBlocked ? '#737373' : '#ef4444' }}
                  >
                    <Ban size={14} />
                    {isActiveBlocked ? 'Unblock' : 'Block User'}
                  </MenuItem>
                </Menu>
              </>
            )}

            {view === 'contacts' && (
              <Typography sx={{ flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: '0.9rem' }}>
                New Conversation
              </Typography>
            )}

            {view === 'roomChat' && activeRoom && (
              <>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: ROOM_LEVEL_COLORS[activeRoom.room_level] || PRIMARY,
                    fontSize: '1rem',
                  }}
                >
                  {activeRoom.icon}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                    {activeRoom.title}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.6rem', opacity: 0.8 }}>
                    {activeRoom.room_level.toUpperCase()} · {activeRoom.member_count} members
                  </Typography>
                </Box>
              </>
            )}

            <IconButton size="small" onClick={() => navigate('/dashboard/chat')} sx={{ color: '#fff', p: 0.5 }} title="Open full chat">
              <Maximize2 size={15} />
            </IconButton>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff', p: 0.5 }}>
              <X size={16} />
            </IconButton>
          </Box>

          {/* ─── CONVERSATIONS VIEW ─── */}
          {view === 'conversations' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Mini tab toggle */}
              <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
                {(['chats', 'rooms'] as const).map((tab) => (
                  <Box
                    key={tab}
                    onClick={() => {
                      setListTab(tab);
                      if (tab === 'rooms') setView('rooms');
                    }}
                    sx={{
                      flex: 1,
                      py: 0.75,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      fontWeight: listTab === tab ? 700 : 500,
                      fontSize: '0.75rem',
                      color: listTab === tab ? PRIMARY : '#999',
                      borderBottom: listTab === tab ? `2px solid ${PRIMARY}` : '2px solid transparent',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      '&:hover': { color: PRIMARY },
                    }}
                  >
                    {tab === 'chats' ? <MessageSquare size={12} /> : <Users size={12} />}
                    {tab === 'chats' ? 'Chats' : 'Rooms'}
                  </Box>
                ))}
              </Box>
              {/* Search */}
              <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Search size={14} color="#999" /></InputAdornment>
                    ),
                    sx: { fontFamily: FONT, fontSize: '0.8rem', borderRadius: 2, height: 34 },
                  }}
                />
              </Box>

              {/* List */}
              <List sx={{ flex: 1, overflowY: 'auto', py: 0 }}>
                {loadingConvos ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} sx={{ color: PRIMARY }} />
                  </Box>
                ) : filteredConversations.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <MessageSquare size={32} color="#ccc" />
                    <Typography sx={{ fontFamily: FONT, color: '#999', mt: 1, fontSize: '0.8rem' }}>
                      {search ? 'No matches' : 'No conversations yet'}
                    </Typography>
                    <Typography
                      onClick={openContacts}
                      sx={{ fontFamily: FONT, color: PRIMARY, cursor: 'pointer', mt: 0.5, fontSize: '0.8rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                    >
                      Start a new chat
                    </Typography>
                  </Box>
                ) : (
                  filteredConversations.map((conv) => (
                    <ListItemButton
                      key={conv.id}
                      onClick={() => openChat(conv.id)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        gap: 1,
                        bgcolor: conv.id === activeConvId ? 'rgba(0,104,55,0.06)' : 'transparent',
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 'auto' }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          invisible={!onlineUsers.has(conv.participant_id)}
                          sx={{ '& .MuiBadge-dot': { bgcolor: ACCENT, width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #fff' } }}
                        >
                          <Avatar
                            src={conv.participant_image || undefined}
                            imgProps={{ referrerPolicy: 'no-referrer' }}
                            sx={{ width: 42, height: 42, bgcolor: PRIMARY, fontFamily: FONT, fontSize: '0.8rem' }}
                          >
                            {conv.participant_name?.[0]?.toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography noWrap sx={{ fontFamily: FONT, fontWeight: conv.unread_count > 0 ? 700 : 500, fontSize: '0.85rem', color: '#1a1c1c' }}>
                                {conv.participant_name}
                              </Typography>
                              {conv.participant_designation && (
                                <Typography
                                  noWrap
                                  sx={{ fontFamily: FONT, fontSize: '0.62rem', fontWeight: 600, color: PRIMARY, lineHeight: 1.2 }}
                                >
                                  {richDesignation(conv)}
                                </Typography>
                              )}
                            </Box>
                            {conv.last_message_at && (
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.6rem', color: conv.unread_count > 0 ? PRIMARY : '#999', flexShrink: 0, ml: 0.5, mt: 0.25 }}>
                                {formatTime(conv.last_message_at)}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.25 }}>
                            <Typography noWrap sx={{ fontFamily: FONT, fontSize: '0.75rem', color: conv.unread_count > 0 ? '#333' : '#999', maxWidth: 190 }}>
                              {conv.last_message_preview || 'No messages yet'}
                            </Typography>
                            {conv.unread_count > 0 && (
                              <Box sx={{ bgcolor: PRIMARY, color: '#fff', borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5, ml: 0.5, flexShrink: 0 }}>
                                <Typography sx={{ fontFamily: FONT, fontSize: '0.6rem', fontWeight: 700 }}>
                                  {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </Box>
          )}

          {/* ─── CHAT VIEW ─── */}
          {view === 'chat' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fafafa' }}>
              {/* Messages */}
              <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                {hasMoreMessages && (
                  <Typography
                    onClick={handleLoadMore}
                    sx={{ fontFamily: FONT, fontSize: '0.7rem', color: PRIMARY, textAlign: 'center', cursor: 'pointer', mb: 0.5, '&:hover': { textDecoration: 'underline' } }}
                  >
                    <ChevronDown size={12} style={{ transform: 'rotate(180deg)', verticalAlign: 'middle' }} /> Load more
                  </Typography>
                )}

                {loadingMessages ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} sx={{ color: PRIMARY }} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontFamily: FONT, color: '#bbb', fontSize: '0.8rem' }}>
                      No messages yet. Say hello!
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn = msg.sender_id === profile?._id;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showDate =
                      !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                    return (
                      <Box key={msg.id}>
                        {showDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                            <Chip
                              label={new Date(msg.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              size="small"
                              sx={{ fontFamily: FONT, fontSize: '0.6rem', bgcolor: 'rgba(0,0,0,0.06)', color: '#666', height: 20 }}
                            />
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', mb: 0.15 }}>
                          <Box
                            sx={{
                              maxWidth: '78%',
                              bgcolor: isOwn ? PRIMARY : '#fff',
                              color: isOwn ? '#fff' : '#222',
                              borderRadius: isOwn ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                              px: 1.5,
                              py: 0.75,
                              boxShadow: isOwn ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                              border: isOwn ? 'none' : '1px solid rgba(0,0,0,0.06)',
                            }}
                          >
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {msg.content}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: FONT,
                                fontSize: '0.55rem',
                                color: isOwn ? 'rgba(255,255,255,0.65)' : '#bbb',
                                textAlign: 'right',
                                mt: 0.15,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 0.3,
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isOwn && <CheckCheck size={10} style={{ opacity: 0.7 }} />}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}

                {/* Typing indicator */}
                {typingText && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                    <Box sx={{ bgcolor: '#fff', borderRadius: '12px 12px 12px 3px', px: 1.25, py: 0.5, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <Box sx={{ display: 'flex', gap: 0.3 }}>
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              bgcolor: '#bbb',
                              animation: 'typingBounce 1.4s infinite',
                              animationDelay: `${i * 0.2}s`,
                              '@keyframes typingBounce': {
                                '0%, 60%, 100%': { transform: 'translateY(0)' },
                                '30%': { transform: 'translateY(-3px)' },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Blocked banner */}
              {isActiveBlocked && (
                <Box sx={{ px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: '#fef2f2', borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                  <Ban size={12} color="#ef4444" />
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: '#ef4444', flex: 1 }}>
                    You blocked this user
                  </Typography>
                  <Typography
                    onClick={handleWidgetBlock}
                    sx={{ fontFamily: FONT, fontSize: '0.68rem', fontWeight: 600, color: PRIMARY, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Unblock
                  </Typography>
                </Box>
              )}

              {/* Input */}
              <Box sx={{ px: 1, py: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fff', display: 'flex', gap: 0.75, alignItems: 'flex-end' }}>
                <TextField
                  multiline
                  maxRows={3}
                  fullWidth
                  placeholder={isActiveBlocked ? 'Blocked' : 'Type a message...'}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isActiveBlocked}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: FONT, fontSize: '0.8rem' } }}
                />
                <IconButton
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sending || isActiveBlocked}
                  sx={{
                    bgcolor: PRIMARY,
                    color: '#fff',
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    '&:hover': { bgcolor: '#084a29' },
                    '&.Mui-disabled': { bgcolor: '#ccc', color: '#fff' },
                  }}
                >
                  <Send size={15} />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* ─── CONTACTS VIEW ─── */}
          {view === 'contacts' && (
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {loadingContacts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} sx={{ color: PRIMARY }} />
                </Box>
              ) : (
                <>
                  {contacts.coordinators.length > 0 && (
                    <>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', fontWeight: 600, color: '#999', px: 1.5, pt: 1.5, pb: 0.5 }}>
                        YOUR COORDINATORS
                      </Typography>
                      <List disablePadding>
                        {contacts.coordinators.map((c) => (
                          <ListItemButton key={c.id} onClick={() => startConversation(c.id)} sx={{ px: 1.5, py: 0.75, gap: 1 }}>
                            <Avatar src={c.profileImage || undefined} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 36, height: 36, bgcolor: PRIMARY, fontSize: '0.75rem' }}>
                              {c.name[0]?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</Typography>
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: '#999' }}>
                                {c.designation}{c.level ? ` (${c.level})` : ''}
                              </Typography>
                            </Box>
                          </ListItemButton>
                        ))}
                      </List>
                    </>
                  )}

                  {contacts.subordinates.length > 0 && (
                    <>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', fontWeight: 600, color: '#999', px: 1.5, pt: 1, pb: 0.5 }}>
                        COORDINATORS IN YOUR JURISDICTION
                      </Typography>
                      <List disablePadding>
                        {contacts.subordinates.map((c) => (
                          <ListItemButton key={c.id} onClick={() => startConversation(c.id)} sx={{ px: 1.5, py: 0.75, gap: 1 }}>
                            <Avatar src={c.profileImage || undefined} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 36, height: 36, bgcolor: PRIMARY, fontSize: '0.75rem' }}>
                              {c.name[0]?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</Typography>
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: '#999' }}>{c.designation}</Typography>
                            </Box>
                          </ListItemButton>
                        ))}
                      </List>
                    </>
                  )}

                  {contacts.coordinators.length === 0 && contacts.subordinates.length === 0 && (
                    <Typography sx={{ fontFamily: FONT, color: '#999', textAlign: 'center', py: 4, px: 2, fontSize: '0.8rem' }}>
                      No contacts available. Complete your profile and location settings first.
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}

          {/* ─── ROOMS VIEW ─── */}
          {view === 'rooms' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Mini tab toggle */}
              <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
                {(['chats', 'rooms'] as const).map((tab) => (
                  <Box
                    key={tab}
                    onClick={() => {
                      setListTab(tab);
                      if (tab === 'chats') setView('conversations');
                    }}
                    sx={{
                      flex: 1,
                      py: 0.75,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      fontWeight: listTab === tab ? 700 : 500,
                      fontSize: '0.75rem',
                      color: listTab === tab ? PRIMARY : '#999',
                      borderBottom: listTab === tab ? `2px solid ${PRIMARY}` : '2px solid transparent',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      '&:hover': { color: PRIMARY },
                    }}
                  >
                    {tab === 'chats' ? <MessageSquare size={12} /> : <Users size={12} />}
                    {tab === 'chats' ? 'Chats' : 'Rooms'}
                  </Box>
                ))}
              </Box>

              <List sx={{ flex: 1, overflowY: 'auto', py: 0 }}>
                {loadingRooms ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} sx={{ color: PRIMARY }} />
                  </Box>
                ) : rooms.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Users size={32} color="#ccc" />
                    <Typography sx={{ fontFamily: FONT, color: '#999', mt: 1, fontSize: '0.8rem' }}>
                      No rooms available
                    </Typography>
                  </Box>
                ) : (
                  rooms.map((room) => {
                    const levelColor = ROOM_LEVEL_COLORS[room.room_level] || PRIMARY;
                    return (
                      <ListItemButton
                        key={room.id}
                        onClick={() => openRoom(room.id)}
                        sx={{ px: 1.5, py: 1, gap: 1 }}
                      >
                        <ListItemAvatar sx={{ minWidth: 'auto' }}>
                          <Avatar sx={{ width: 42, height: 42, bgcolor: levelColor, fontSize: '1.25rem' }}>
                            {room.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          disableTypography
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography noWrap sx={{ fontFamily: FONT, fontWeight: room.unread_count > 0 ? 700 : 500, fontSize: '0.85rem', maxWidth: 170 }}>
                                {room.title}
                              </Typography>
                              {room.last_message_at && (
                                <Typography sx={{ fontFamily: FONT, fontSize: '0.6rem', color: room.unread_count > 0 ? PRIMARY : '#999', flexShrink: 0, ml: 0.5 }}>
                                  {formatTime(room.last_message_at)}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip
                                  label={room.room_level.toUpperCase()}
                                  size="small"
                                  sx={{ fontFamily: FONT, fontSize: '0.55rem', fontWeight: 700, height: 16, bgcolor: `${levelColor}15`, color: levelColor }}
                                />
                                <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: '#999' }}>
                                  {room.member_count}
                                </Typography>
                              </Box>
                              {room.unread_count > 0 && (
                                <Box sx={{ bgcolor: PRIMARY, color: '#fff', borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5, ml: 0.5, flexShrink: 0 }}>
                                  <Typography sx={{ fontFamily: FONT, fontSize: '0.6rem', fontWeight: 700 }}>
                                    {room.unread_count > 99 ? '99+' : room.unread_count}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    );
                  })
                )}
              </List>
            </Box>
          )}

          {/* ─── ROOM CHAT VIEW ─── */}
          {view === 'roomChat' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fafafa' }}>
              {/* Messages */}
              <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                {hasMoreRoomMsgs && (
                  <Typography
                    onClick={handleRoomLoadMore}
                    sx={{ fontFamily: FONT, fontSize: '0.7rem', color: PRIMARY, textAlign: 'center', cursor: 'pointer', mb: 0.5, '&:hover': { textDecoration: 'underline' } }}
                  >
                    <ChevronDown size={12} style={{ transform: 'rotate(180deg)', verticalAlign: 'middle' }} /> Load more
                  </Typography>
                )}

                {loadingRoomMsgs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} sx={{ color: PRIMARY }} />
                  </Box>
                ) : roomMessages.length === 0 ? (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontFamily: FONT, color: '#bbb', fontSize: '0.8rem' }}>
                      No messages yet. Start the conversation!
                    </Typography>
                  </Box>
                ) : (
                  roomMessages.map((msg, idx) => {
                    const isOwn = msg.sender_id === profile?._id;
                    const prevMsg = idx > 0 ? roomMessages[idx - 1] : null;
                    const showSender = !isOwn && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
                    const showDate = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                    return (
                      <Box key={msg.id}>
                        {showDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                            <Chip
                              label={new Date(msg.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              size="small"
                              sx={{ fontFamily: FONT, fontSize: '0.6rem', bgcolor: 'rgba(0,0,0,0.06)', color: '#666', height: 20 }}
                            />
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', mb: 0.15 }}>
                          <Box
                            sx={{
                              maxWidth: '78%',
                              bgcolor: msg.is_deleted ? 'rgba(0,0,0,0.04)' : isOwn ? PRIMARY : '#fff',
                              color: msg.is_deleted ? '#999' : isOwn ? '#fff' : '#222',
                              borderRadius: isOwn ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                              px: 1.5,
                              py: 0.75,
                              boxShadow: isOwn ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                              border: isOwn ? 'none' : '1px solid rgba(0,0,0,0.06)',
                              fontStyle: msg.is_deleted ? 'italic' : 'normal',
                            }}
                          >
                            {showSender && !msg.is_deleted && (
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', fontWeight: 700, color: ROOM_LEVEL_COLORS[activeRoom?.room_level || 'national'], mb: 0.15 }}>
                                {msg.sender_name}
                              </Typography>
                            )}
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {msg.content}
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.55rem', color: isOwn ? 'rgba(255,255,255,0.65)' : '#bbb', textAlign: 'right', mt: 0.15 }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={roomMessagesEndRef} />
              </Box>

              {/* Error banner */}
              {roomSendError && (
                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#FFF3E0', borderTop: '1px solid #FFE0B2' }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: '#E65100' }}>
                    {roomSendError}
                  </Typography>
                </Box>
              )}

              {/* Input */}
              <Box sx={{ px: 1, py: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fff', display: 'flex', gap: 0.75, alignItems: 'flex-end' }}>
                <TextField
                  multiline
                  maxRows={3}
                  fullWidth
                  placeholder="Type a message..."
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  onKeyDown={handleRoomKeyDown}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: FONT, fontSize: '0.8rem' } }}
                />
                <IconButton
                  onClick={handleSendRoomMsg}
                  disabled={!roomInput.trim() || sendingRoom}
                  sx={{
                    bgcolor: PRIMARY,
                    color: '#fff',
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    '&:hover': { bgcolor: '#084a29' },
                    '&.Mui-disabled': { bgcolor: '#ccc', color: '#fff' },
                  }}
                >
                  <Send size={15} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Paper>
      </Slide>

      {/* Block confirmation dialog */}
      <Dialog open={blockConfirmOpen} onClose={() => setBlockConfirmOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem' }}>
          Block {activeConversation?.participant_name}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>
            They won't be able to send you direct messages. You can unblock them anytime.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockConfirmOpen(false)} sx={{ fontFamily: FONT, textTransform: 'none', color: '#737373', fontSize: '0.82rem' }}>
            Cancel
          </Button>
          <Button
            onClick={handleWidgetBlock}
            variant="contained"
            disabled={blockLoading}
            sx={{ fontFamily: FONT, textTransform: 'none', bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, fontSize: '0.82rem' }}
          >
            {blockLoading ? 'Blocking…' : 'Block'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
