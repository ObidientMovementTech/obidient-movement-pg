import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as sio;
import '../config/env.dart';
import '../storage/secure_storage.dart';

/// Singleton Socket.IO service for real-time chat events.
class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  sio.Socket? _socket;
  bool _disposed = false;

  // ── Stream controllers for incoming events ───────────────────

  final _newMessageCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _messageReadCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _conversationUpdatedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _typingStartCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _typingStopCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _presenceCtrl =
      StreamController<Map<String, dynamic>>.broadcast();

  // Room events
  final _roomMessageCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomMessageDeletedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomMessagePinnedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomUserMutedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomYouMutedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomYouUnmutedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomUserBannedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomYouBannedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();

  // DM reaction & deletion events
  final _reactionUpdatedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _messageDeletedCtrl =
      StreamController<Map<String, dynamic>>.broadcast();

  // ── Public streams ───────────────────────────────────────────

  Stream<Map<String, dynamic>> get onNewMessage => _newMessageCtrl.stream;
  Stream<Map<String, dynamic>> get onMessageRead => _messageReadCtrl.stream;
  Stream<Map<String, dynamic>> get onConversationUpdated =>
      _conversationUpdatedCtrl.stream;
  Stream<Map<String, dynamic>> get onTypingStart => _typingStartCtrl.stream;
  Stream<Map<String, dynamic>> get onTypingStop => _typingStopCtrl.stream;
  Stream<Map<String, dynamic>> get onPresenceChange => _presenceCtrl.stream;

  Stream<Map<String, dynamic>> get onRoomMessage => _roomMessageCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomMessageDeleted =>
      _roomMessageDeletedCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomMessagePinned =>
      _roomMessagePinnedCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomUserMuted =>
      _roomUserMutedCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomYouMuted =>
      _roomYouMutedCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomYouUnmuted =>
      _roomYouUnmutedCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomUserBanned =>
      _roomUserBannedCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomYouBanned =>
      _roomYouBannedCtrl.stream;

  Stream<Map<String, dynamic>> get onReactionUpdated =>
      _reactionUpdatedCtrl.stream;
  Stream<Map<String, dynamic>> get onMessageDeleted =>
      _messageDeletedCtrl.stream;

  bool get isConnected => _socket?.connected ?? false;

  // ── Connect ──────────────────────────────────────────────────

  Future<void> connect() async {
    if (_socket?.connected == true) return;

    final token = await SecureStorage.getToken();
    if (token == null) return;

    _disposed = false;

    _socket = sio.io(
      Env.wsUrl,
      sio.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(1000)
          .setReconnectionDelayMax(5000)
          .build(),
    );

    _socket!.onConnect((_) {
      debugPrint('[Socket] Connected');
    });

    _socket!.onDisconnect((_) {
      debugPrint('[Socket] Disconnected');
    });

    _socket!.onConnectError((err) {
      debugPrint('[Socket] Connection error: $err');
    });

    // ── DM events ──────────────────────────────────────────────

    _socket!.on('message:new', (data) {
      if (!_disposed) _newMessageCtrl.add(_castMap(data));
    });

    _socket!.on('message:read', (data) {
      if (!_disposed) _messageReadCtrl.add(_castMap(data));
    });

    _socket!.on('conversation:updated', (data) {
      if (!_disposed) _conversationUpdatedCtrl.add(_castMap(data));
    });

    _socket!.on('typing:start', (data) {
      if (!_disposed) _typingStartCtrl.add(_castMap(data));
    });

    _socket!.on('typing:stop', (data) {
      if (!_disposed) _typingStopCtrl.add(_castMap(data));
    });

    _socket!.on('presence:change', (data) {
      if (!_disposed) _presenceCtrl.add(_castMap(data));
    });

    // ── Room events ────────────────────────────────────────────

    _socket!.on('room:message:new', (data) {
      if (!_disposed) _roomMessageCtrl.add(_castMap(data));
    });

    _socket!.on('room:message:deleted', (data) {
      if (!_disposed) _roomMessageDeletedCtrl.add(_castMap(data));
    });

    _socket!.on('room:message:pinned', (data) {
      if (!_disposed) _roomMessagePinnedCtrl.add(_castMap(data));
    });

    _socket!.on('room:user:muted', (data) {
      if (!_disposed) _roomUserMutedCtrl.add(_castMap(data));
    });

    _socket!.on('room:you:muted', (data) {
      if (!_disposed) _roomYouMutedCtrl.add(_castMap(data));
    });

    _socket!.on('room:you:unmuted', (data) {
      if (!_disposed) _roomYouUnmutedCtrl.add(_castMap(data));
    });

    _socket!.on('room:user:banned', (data) {
      if (!_disposed) _roomUserBannedCtrl.add(_castMap(data));
    });

    _socket!.on('room:you:banned', (data) {
      if (!_disposed) _roomYouBannedCtrl.add(_castMap(data));
    });

    // ── DM reaction & deletion events ──────────────────────────

    _socket!.on('reaction:updated', (data) {
      if (!_disposed) _reactionUpdatedCtrl.add(_castMap(data));
    });

    _socket!.on('message:deleted', (data) {
      if (!_disposed) _messageDeletedCtrl.add(_castMap(data));
    });
  }

  // ── Emit helpers ─────────────────────────────────────────────

  void joinConversation(String conversationId) {
    _socket?.emit('conversation:join', conversationId);
  }

  void leaveConversation(String conversationId) {
    _socket?.emit('conversation:leave', conversationId);
  }

  void startTyping(String conversationId) {
    _socket?.emit('typing:start', conversationId);
  }

  void stopTyping(String conversationId) {
    _socket?.emit('typing:stop', conversationId);
  }

  void markRead(String conversationId) {
    _socket?.emit('message:read', conversationId);
  }

  void joinRoom(String roomId) {
    _socket?.emit('room:join', roomId);
  }

  void leaveRoom(String roomId) {
    _socket?.emit('room:leave', roomId);
  }

  void markRoomRead(String roomId) {
    _socket?.emit('room:read', roomId);
  }

  // ── Disconnect ───────────────────────────────────────────────

  void disconnect() {
    _disposed = true;
    _socket?.dispose();
    _socket = null;
  }

  // ── Util ─────────────────────────────────────────────────────

  Map<String, dynamic> _castMap(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return <String, dynamic>{};
  }
}
