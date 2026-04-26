import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUser } from '../../../../context/UserContext';
import { useSocket, type ChatMessage, type TypingEvent, type ConversationUpdate, type ReactionUpdateEvent, type MessageDeletedEvent } from '../../../../context/SocketContext';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage as apiSendMessage,
  toggleReaction as apiToggleReaction,
  deleteMessage as apiDeleteMessage,
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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Contacts dialog
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<{ coordinators: ChatContact[]; subordinates: ChatContact[] }>({
    coordinators: [],
    subordinates: [],
  });
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [pendingParticipant, setPendingParticipant] = useState<ChatContact | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            reply_to_id: msg.reply_to_id ?? null,
            reply_to_content: msg.reply_to_content ?? null,
            reply_to_sender_name: msg.reply_to_sender_name ?? null,
            reply_to_sender_id: msg.reply_to_sender_id ?? null,
            reactions: msg.reactions ?? [],
            deleted_at: msg.deleted_at ?? null,
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
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('conversation:created', handleConversationCreated);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('reaction:updated', handleReactionUpdated);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, activeConvId, profile?._id, loadConversations]);

  // ── Actions ──
  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || sending) return;
    if (!activeConvId && !pendingParticipant) return;

    const replyToId = replyingTo?.id;
    setMessageInput('');
    setReplyingTo(null);
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

      const data = await apiSendMessage(convId, content, replyToId);
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

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!activeConvId) return;
    try {
      const data = await apiToggleReaction(activeConvId, messageId, emoji);
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, reactions: data.reactions } : m)
      );
    } catch (err) {
      console.error('Failed to toggle reaction', err);
    }
  };

  const handleDeleteMessage = async (messageId: string, mode: 'for_me' | 'for_everyone') => {
    if (!activeConvId) return;
    try {
      await apiDeleteMessage(activeConvId, messageId, mode);
      if (mode === 'for_me') {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, deleted_at: new Date().toISOString(), content: 'This message was deleted' }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const selectConversation = (id: string) => {
    setActiveConvId(id);
    setMobileShowChat(true);
  };

  const goBackToList = () => {
    setMobileShowChat(false);
    setActiveConvId(null);
    setPendingParticipant(null);
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

  const startConversation = (participantId: string) => {
    setShowContacts(false);
    // Check local conversations first
    const existing = conversations.find((c) => c.participant_id === participantId);
    if (existing) {
      setActiveConvId(existing.id);
      setPendingParticipant(null);
      setMobileShowChat(true);
    } else {
      // Find contact info from loaded contacts
      const allContacts = [...contacts.coordinators, ...contacts.subordinates];
      const contact = allContacts.find((c) => c.id === participantId);
      setPendingParticipant(contact ?? { id: participantId, name: 'User', email: '', phone: null, profileImage: null, designation: '' });
      setActiveConvId(null);
      setMessages([]);
      setMobileShowChat(true);
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
    replyingTo,
    // Contacts
    showContacts,
    contacts,
    loadingContacts,
    // Actions
    setSearch,
    setMessageInput: handleInputChange,
    handleSend,
    handleToggleReaction,
    handleDeleteMessage,
    handleReply,
    cancelReply,
    selectConversation,
    goBackToList,
    handleLoadMore,
    openContactsDialog,
    closeContactsDialog: () => setShowContacts(false),
    startConversation,
  };
}
