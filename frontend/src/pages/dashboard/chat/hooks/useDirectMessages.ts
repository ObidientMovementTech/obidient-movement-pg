import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUser } from '../../../../context/UserContext';
import { useSocket, type ChatMessage, type TypingEvent, type ConversationUpdate } from '../../../../context/SocketContext';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage as apiSendMessage,
  getChatContacts,
  type Conversation,
  type Message,
  type ChatContact,
} from '../../../../services/conversationService';

export function useDirectMessages() {
  const { profile } = useUser();
  const {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    startTyping: emitStartTyping,
    stopTyping: emitStopTyping,
  } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Contacts dialog
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<{ coordinators: ChatContact[]; subordinates: ChatContact[] }>({
    coordinators: [],
    subordinates: [],
  });
  const [loadingContacts, setLoadingContacts] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConvId) ?? null,
    [conversations, activeConvId]
  );

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages when conv changes ──
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
      } catch (err) {
        console.error('Failed to load messages', err);
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

  // ── Socket listeners ──
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
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
          }];
        });
      }
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.conversation_id);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          last_message_at: msg.created_at,
          last_message_preview: msg.content.length > 100 ? msg.content.slice(0, 100) + '...' : msg.content,
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

    const handleConversationUpdated = (data: ConversationUpdate) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === data.conversationId);
        if (idx === -1) { loadConversations(); return prev; }
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          last_message_at: data.lastMessageAt,
          last_message_preview: data.lastMessagePreview,
        };
        const [item] = updated.splice(idx, 1);
        updated.unshift(item);
        return updated;
      });
    };

    const handleConversationCreated = () => { loadConversations(); };

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
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('conversation:created', handleConversationCreated);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('conversation:created', handleConversationCreated);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, activeConvId, profile?._id, loadConversations]);

  // ── Actions ──
  const handleSend = async () => {
    if (!activeConvId || !messageInput.trim() || sending) return;
    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitStopTyping(activeConvId);

    try {
      const data = await apiSendMessage(activeConvId, content);
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
          }];
        });
        const preview = content.length > 100 ? content.slice(0, 100) + '...' : content;
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === activeConvId);
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            last_message_at: data.message.created_at,
            last_message_preview: preview,
            unread_count: 0,
          };
          const [item] = updated.splice(idx, 1);
          updated.unshift(item);
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    if (!activeConvId) return;
    emitStartTyping(activeConvId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(activeConvId);
    }, 3000);
  };

  const selectConversation = (id: string) => {
    setActiveConvId(id);
    setMobileShowChat(true);
  };

  const goBackToList = () => {
    setMobileShowChat(false);
    setActiveConvId(null);
  };

  const handleLoadMore = async () => {
    if (!activeConvId || !hasMoreMessages || messages.length === 0) return;
    const oldest = messages[0];
    const data = await getMessages(activeConvId, { before: oldest.created_at });
    setMessages((prev) => [...data.messages, ...prev]);
    setHasMoreMessages(data.hasMore);
  };

  const openContactsDialog = async () => {
    setShowContacts(true);
    setLoadingContacts(true);
    try {
      const data = await getChatContacts();
      setContacts({ coordinators: data.coordinators, subordinates: data.subordinates });
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const startConversation = async (participantId: string) => {
    setShowContacts(false);
    try {
      const data = await getOrCreateConversation(participantId);
      if (data.created) await loadConversations();
      setActiveConvId(data.conversationId);
      setMobileShowChat(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Cannot start conversation';
      alert(msg);
    }
  };

  // ── Derived ──
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.participant_name?.toLowerCase().includes(q));
  }, [conversations, search]);

  const typingText = useMemo(() => {
    const names = Array.from(typingUsers.values());
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.join(', ')} are typing...`;
  }, [typingUsers]);

  return {
    // State
    conversations: filteredConversations,
    loadingConvos,
    activeConvId,
    activeConversation,
    messages,
    loadingMessages,
    hasMoreMessages,
    messageInput,
    sending,
    search,
    typingText,
    mobileShowChat,
    isConnected,
    onlineUsers,
    profileId: profile?._id,
    // Contacts
    showContacts,
    contacts,
    loadingContacts,
    // Actions
    setSearch,
    setMessageInput: handleInputChange,
    handleSend,
    selectConversation,
    goBackToList,
    handleLoadMore,
    openContactsDialog,
    closeContactsDialog: () => setShowContacts(false),
    startConversation,
  };
}
