import { useState, useEffect, useMemo } from 'react';
import { useUser } from '../../../../context/UserContext';
import { useSocket } from '../../../../context/SocketContext';
import {
  getMyRooms,
  getRoomMessages,
  sendRoomMessage,
  deleteRoomMessage,
  pinRoomMessage,
  muteRoomUser,
  banRoomUser,
  getRoomMembers,
  cleanupRoom,
  type Room,
  type RoomMessage,
} from '../../../../services/roomService';

export function useCommunityRooms(active: boolean) {
  const { profile } = useUser();
  const { socket, isConnected } = useSocket();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [loadingRoomMsgs, setLoadingRoomMsgs] = useState(false);
  const [hasMoreRoomMsgs, setHasMoreRoomMsgs] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [sendingRoom, setSendingRoom] = useState(false);
  const [roomSendError, setRoomSendError] = useState<string | null>(null);
  const [mobileShowRoom, setMobileShowRoom] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ anchorEl: HTMLElement; message: RoomMessage } | null>(null);
  const [myRoomRole, setMyRoomRole] = useState<'admin' | 'moderator' | 'member'>('member');

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) ?? null,
    [rooms, activeRoomId]
  );

  // ── Load rooms ──
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const load = async () => {
      setLoadingRooms(true);
      try {
        const data = await getMyRooms();
        if (!cancelled) setRooms(data.rooms);
      } catch (err) {
        console.error('Failed to load rooms', err);
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [active]);

  // ── Load room messages ──
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
      } catch (err) {
        console.error('Failed to load room messages', err);
      } finally {
        if (!cancelled) setLoadingRoomMsgs(false);
      }
    };

    load();

    const checkRole = async () => {
      try {
        const data = await getRoomMembers(activeRoomId, 1, 50);
        const me = data.members.find((m: any) => m.id === profile?._id);
        setMyRoomRole(me ? me.role : 'member');
      } catch {
        setMyRoomRole('member');
      }
    };
    checkRole();

    socket?.emit('room:join', activeRoomId);

    return () => {
      cancelled = true;
      socket?.emit('room:leave', activeRoomId);
    };
  }, [activeRoomId, socket, profile?._id]);

  // ── Socket listeners ──
  useEffect(() => {
    if (!socket) return;

    const handleRoomMessage = (msg: RoomMessage & { conversation_id: string }) => {
      if (msg.conversation_id === activeRoomId) {
        setRoomMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id !== msg.conversation_id) return r;
          return {
            ...r,
            last_message_at: msg.created_at,
            last_message_preview: msg.content.length > 100 ? msg.content.slice(0, 100) + '...' : msg.content,
            unread_count: msg.conversation_id === activeRoomId ? 0 : r.unread_count + 1,
          };
        })
      );
    };

    const handleRoomMsgDeleted = (data: { roomId: string; messageId: string }) => {
      if (data.roomId === activeRoomId) {
        setRoomMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId ? { ...m, is_deleted: true, content: '[Message deleted]' } : m
          )
        );
      }
    };

    const handleRoomMsgPinned = (data: { roomId: string; messageId: string; pinned: boolean }) => {
      if (data.roomId === activeRoomId) {
        setRoomMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, is_pinned: data.pinned } : m))
        );
      }
    };

    socket.on('room:message:new', handleRoomMessage);
    socket.on('room:message:deleted', handleRoomMsgDeleted);
    socket.on('room:message:pinned', handleRoomMsgPinned);

    return () => {
      socket.off('room:message:new', handleRoomMessage);
      socket.off('room:message:deleted', handleRoomMsgDeleted);
      socket.off('room:message:pinned', handleRoomMsgPinned);
    };
  }, [socket, activeRoomId]);

  // ── Actions ──
  const handleSendRoomMsg = async () => {
    if (!activeRoomId || !roomInput.trim() || sendingRoom) return;
    const content = roomInput.trim();
    setRoomInput('');
    setSendingRoom(true);
    setRoomSendError(null);

    try {
      const data = await sendRoomMessage(activeRoomId, content);
      if (data.message) {
        setRoomMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to send message';
      setRoomSendError(msg);
      setRoomInput(content);
      setTimeout(() => setRoomSendError(null), 5000);
    } finally {
      setSendingRoom(false);
    }
  };

  const selectRoom = (id: string) => {
    setActiveRoomId(id);
    setMobileShowRoom(true);
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, unread_count: 0 } : r)));
  };

  const goBackToRoomList = () => {
    setMobileShowRoom(false);
    setActiveRoomId(null);
  };

  const handleLoadMore = async () => {
    if (!activeRoomId || !hasMoreRoomMsgs || roomMessages.length === 0) return;
    const oldest = roomMessages[0];
    const data = await getRoomMessages(activeRoomId, { before: oldest.created_at });
    setRoomMessages((prev) => [...data.messages, ...prev]);
    setHasMoreRoomMsgs(data.hasMore);
  };

  const handleDeleteMsg = async (msgId: string) => {
    if (!activeRoomId) return;
    try { await deleteRoomMessage(activeRoomId, msgId); } catch (err) { console.error('Delete failed', err); }
    setContextMenu(null);
  };

  const handlePinMsg = async (msgId: string) => {
    if (!activeRoomId) return;
    try { await pinRoomMessage(activeRoomId, msgId); } catch (err) { console.error('Pin failed', err); }
    setContextMenu(null);
  };

  const handleMuteUser = async (userId: string) => {
    if (!activeRoomId) return;
    try { await muteRoomUser(activeRoomId, userId, 60); } catch (err) { console.error('Mute failed', err); }
    setContextMenu(null);
  };

  const handleBanUser = async (userId: string) => {
    if (!activeRoomId) return;
    if (!confirm('Are you sure you want to ban this user from the room?')) return;
    try { await banRoomUser(activeRoomId, userId); } catch (err) { console.error('Ban failed', err); }
    setContextMenu(null);
  };

  const handleCleanupRoom = async () => {
    if (!activeRoomId) return;
    if (!confirm('This will permanently delete ALL messages in this room. Are you sure?')) return;
    try {
      const result = await cleanupRoom(activeRoomId);
      setRoomMessages([]);
      alert(`Cleaned up ${result.deleted} messages.`);
    } catch (err) {
      console.error('Cleanup failed', err);
    }
  };

  return {
    rooms,
    loadingRooms,
    activeRoomId,
    activeRoom,
    roomMessages,
    loadingRoomMsgs,
    hasMoreRoomMsgs,
    roomInput,
    sendingRoom,
    roomSendError,
    mobileShowRoom,
    contextMenu,
    myRoomRole,
    isConnected,
    profileId: profile?._id,
    // Actions
    setRoomInput,
    handleSendRoomMsg,
    selectRoom,
    goBackToRoomList,
    handleLoadMore,
    handleDeleteMsg,
    handlePinMsg,
    handleMuteUser,
    handleBanUser,
    handleCleanupRoom,
    setContextMenu,
  };
}
