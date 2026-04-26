// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chat_message.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ChatMessage _$ChatMessageFromJson(Map<String, dynamic> json) {
  return _ChatMessage.fromJson(json);
}

/// @nodoc
mixin _$ChatMessage {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'conversation_id')
  String? get conversationId => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_id')
  String get senderId => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_name')
  String? get senderName => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_image')
  String? get senderImage => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  @JsonKey(name: 'message_type')
  String get messageType => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'edited_at')
  String? get editedAt => throw _privateConstructorUsedError; // Reply support
  @JsonKey(name: 'reply_to_id')
  String? get replyToId => throw _privateConstructorUsedError;
  @JsonKey(name: 'reply_to_content')
  String? get replyToContent => throw _privateConstructorUsedError;
  @JsonKey(name: 'reply_to_sender_name')
  String? get replyToSenderName => throw _privateConstructorUsedError;
  @JsonKey(name: 'reply_to_sender_id')
  String? get replyToSenderId =>
      throw _privateConstructorUsedError; // Reactions
  List<MessageReaction> get reactions =>
      throw _privateConstructorUsedError; // Deletion
  @JsonKey(name: 'deleted_at')
  String? get deletedAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ChatMessageCopyWith<ChatMessage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatMessageCopyWith<$Res> {
  factory $ChatMessageCopyWith(
          ChatMessage value, $Res Function(ChatMessage) then) =
      _$ChatMessageCopyWithImpl<$Res, ChatMessage>;
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'conversation_id') String? conversationId,
      @JsonKey(name: 'sender_id') String senderId,
      @JsonKey(name: 'sender_name') String? senderName,
      @JsonKey(name: 'sender_image') String? senderImage,
      String content,
      @JsonKey(name: 'message_type') String messageType,
      @JsonKey(name: 'created_at') String createdAt,
      @JsonKey(name: 'edited_at') String? editedAt,
      @JsonKey(name: 'reply_to_id') String? replyToId,
      @JsonKey(name: 'reply_to_content') String? replyToContent,
      @JsonKey(name: 'reply_to_sender_name') String? replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') String? replyToSenderId,
      List<MessageReaction> reactions,
      @JsonKey(name: 'deleted_at') String? deletedAt});
}

/// @nodoc
class _$ChatMessageCopyWithImpl<$Res, $Val extends ChatMessage>
    implements $ChatMessageCopyWith<$Res> {
  _$ChatMessageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? conversationId = freezed,
    Object? senderId = null,
    Object? senderName = freezed,
    Object? senderImage = freezed,
    Object? content = null,
    Object? messageType = null,
    Object? createdAt = null,
    Object? editedAt = freezed,
    Object? replyToId = freezed,
    Object? replyToContent = freezed,
    Object? replyToSenderName = freezed,
    Object? replyToSenderId = freezed,
    Object? reactions = null,
    Object? deletedAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      conversationId: freezed == conversationId
          ? _value.conversationId
          : conversationId // ignore: cast_nullable_to_non_nullable
              as String?,
      senderId: null == senderId
          ? _value.senderId
          : senderId // ignore: cast_nullable_to_non_nullable
              as String,
      senderName: freezed == senderName
          ? _value.senderName
          : senderName // ignore: cast_nullable_to_non_nullable
              as String?,
      senderImage: freezed == senderImage
          ? _value.senderImage
          : senderImage // ignore: cast_nullable_to_non_nullable
              as String?,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      messageType: null == messageType
          ? _value.messageType
          : messageType // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      editedAt: freezed == editedAt
          ? _value.editedAt
          : editedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToId: freezed == replyToId
          ? _value.replyToId
          : replyToId // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToContent: freezed == replyToContent
          ? _value.replyToContent
          : replyToContent // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToSenderName: freezed == replyToSenderName
          ? _value.replyToSenderName
          : replyToSenderName // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToSenderId: freezed == replyToSenderId
          ? _value.replyToSenderId
          : replyToSenderId // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: null == reactions
          ? _value.reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as List<MessageReaction>,
      deletedAt: freezed == deletedAt
          ? _value.deletedAt
          : deletedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ChatMessageImplCopyWith<$Res>
    implements $ChatMessageCopyWith<$Res> {
  factory _$$ChatMessageImplCopyWith(
          _$ChatMessageImpl value, $Res Function(_$ChatMessageImpl) then) =
      __$$ChatMessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'conversation_id') String? conversationId,
      @JsonKey(name: 'sender_id') String senderId,
      @JsonKey(name: 'sender_name') String? senderName,
      @JsonKey(name: 'sender_image') String? senderImage,
      String content,
      @JsonKey(name: 'message_type') String messageType,
      @JsonKey(name: 'created_at') String createdAt,
      @JsonKey(name: 'edited_at') String? editedAt,
      @JsonKey(name: 'reply_to_id') String? replyToId,
      @JsonKey(name: 'reply_to_content') String? replyToContent,
      @JsonKey(name: 'reply_to_sender_name') String? replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') String? replyToSenderId,
      List<MessageReaction> reactions,
      @JsonKey(name: 'deleted_at') String? deletedAt});
}

/// @nodoc
class __$$ChatMessageImplCopyWithImpl<$Res>
    extends _$ChatMessageCopyWithImpl<$Res, _$ChatMessageImpl>
    implements _$$ChatMessageImplCopyWith<$Res> {
  __$$ChatMessageImplCopyWithImpl(
      _$ChatMessageImpl _value, $Res Function(_$ChatMessageImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? conversationId = freezed,
    Object? senderId = null,
    Object? senderName = freezed,
    Object? senderImage = freezed,
    Object? content = null,
    Object? messageType = null,
    Object? createdAt = null,
    Object? editedAt = freezed,
    Object? replyToId = freezed,
    Object? replyToContent = freezed,
    Object? replyToSenderName = freezed,
    Object? replyToSenderId = freezed,
    Object? reactions = null,
    Object? deletedAt = freezed,
  }) {
    return _then(_$ChatMessageImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      conversationId: freezed == conversationId
          ? _value.conversationId
          : conversationId // ignore: cast_nullable_to_non_nullable
              as String?,
      senderId: null == senderId
          ? _value.senderId
          : senderId // ignore: cast_nullable_to_non_nullable
              as String,
      senderName: freezed == senderName
          ? _value.senderName
          : senderName // ignore: cast_nullable_to_non_nullable
              as String?,
      senderImage: freezed == senderImage
          ? _value.senderImage
          : senderImage // ignore: cast_nullable_to_non_nullable
              as String?,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      messageType: null == messageType
          ? _value.messageType
          : messageType // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      editedAt: freezed == editedAt
          ? _value.editedAt
          : editedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToId: freezed == replyToId
          ? _value.replyToId
          : replyToId // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToContent: freezed == replyToContent
          ? _value.replyToContent
          : replyToContent // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToSenderName: freezed == replyToSenderName
          ? _value.replyToSenderName
          : replyToSenderName // ignore: cast_nullable_to_non_nullable
              as String?,
      replyToSenderId: freezed == replyToSenderId
          ? _value.replyToSenderId
          : replyToSenderId // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: null == reactions
          ? _value._reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as List<MessageReaction>,
      deletedAt: freezed == deletedAt
          ? _value.deletedAt
          : deletedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatMessageImpl implements _ChatMessage {
  const _$ChatMessageImpl(
      {required this.id,
      @JsonKey(name: 'conversation_id') this.conversationId,
      @JsonKey(name: 'sender_id') required this.senderId,
      @JsonKey(name: 'sender_name') this.senderName,
      @JsonKey(name: 'sender_image') this.senderImage,
      required this.content,
      @JsonKey(name: 'message_type') this.messageType = 'text',
      @JsonKey(name: 'created_at') required this.createdAt,
      @JsonKey(name: 'edited_at') this.editedAt,
      @JsonKey(name: 'reply_to_id') this.replyToId,
      @JsonKey(name: 'reply_to_content') this.replyToContent,
      @JsonKey(name: 'reply_to_sender_name') this.replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') this.replyToSenderId,
      final List<MessageReaction> reactions = const [],
      @JsonKey(name: 'deleted_at') this.deletedAt})
      : _reactions = reactions;

  factory _$ChatMessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatMessageImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'conversation_id')
  final String? conversationId;
  @override
  @JsonKey(name: 'sender_id')
  final String senderId;
  @override
  @JsonKey(name: 'sender_name')
  final String? senderName;
  @override
  @JsonKey(name: 'sender_image')
  final String? senderImage;
  @override
  final String content;
  @override
  @JsonKey(name: 'message_type')
  final String messageType;
  @override
  @JsonKey(name: 'created_at')
  final String createdAt;
  @override
  @JsonKey(name: 'edited_at')
  final String? editedAt;
// Reply support
  @override
  @JsonKey(name: 'reply_to_id')
  final String? replyToId;
  @override
  @JsonKey(name: 'reply_to_content')
  final String? replyToContent;
  @override
  @JsonKey(name: 'reply_to_sender_name')
  final String? replyToSenderName;
  @override
  @JsonKey(name: 'reply_to_sender_id')
  final String? replyToSenderId;
// Reactions
  final List<MessageReaction> _reactions;
// Reactions
  @override
  @JsonKey()
  List<MessageReaction> get reactions {
    if (_reactions is EqualUnmodifiableListView) return _reactions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_reactions);
  }

// Deletion
  @override
  @JsonKey(name: 'deleted_at')
  final String? deletedAt;

  @override
  String toString() {
    return 'ChatMessage(id: $id, conversationId: $conversationId, senderId: $senderId, senderName: $senderName, senderImage: $senderImage, content: $content, messageType: $messageType, createdAt: $createdAt, editedAt: $editedAt, replyToId: $replyToId, replyToContent: $replyToContent, replyToSenderName: $replyToSenderName, replyToSenderId: $replyToSenderId, reactions: $reactions, deletedAt: $deletedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatMessageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.conversationId, conversationId) ||
                other.conversationId == conversationId) &&
            (identical(other.senderId, senderId) ||
                other.senderId == senderId) &&
            (identical(other.senderName, senderName) ||
                other.senderName == senderName) &&
            (identical(other.senderImage, senderImage) ||
                other.senderImage == senderImage) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.messageType, messageType) ||
                other.messageType == messageType) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.editedAt, editedAt) ||
                other.editedAt == editedAt) &&
            (identical(other.replyToId, replyToId) ||
                other.replyToId == replyToId) &&
            (identical(other.replyToContent, replyToContent) ||
                other.replyToContent == replyToContent) &&
            (identical(other.replyToSenderName, replyToSenderName) ||
                other.replyToSenderName == replyToSenderName) &&
            (identical(other.replyToSenderId, replyToSenderId) ||
                other.replyToSenderId == replyToSenderId) &&
            const DeepCollectionEquality()
                .equals(other._reactions, _reactions) &&
            (identical(other.deletedAt, deletedAt) ||
                other.deletedAt == deletedAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      conversationId,
      senderId,
      senderName,
      senderImage,
      content,
      messageType,
      createdAt,
      editedAt,
      replyToId,
      replyToContent,
      replyToSenderName,
      replyToSenderId,
      const DeepCollectionEquality().hash(_reactions),
      deletedAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatMessageImplCopyWith<_$ChatMessageImpl> get copyWith =>
      __$$ChatMessageImplCopyWithImpl<_$ChatMessageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatMessageImplToJson(
      this,
    );
  }
}

abstract class _ChatMessage implements ChatMessage {
  const factory _ChatMessage(
      {required final String id,
      @JsonKey(name: 'conversation_id') final String? conversationId,
      @JsonKey(name: 'sender_id') required final String senderId,
      @JsonKey(name: 'sender_name') final String? senderName,
      @JsonKey(name: 'sender_image') final String? senderImage,
      required final String content,
      @JsonKey(name: 'message_type') final String messageType,
      @JsonKey(name: 'created_at') required final String createdAt,
      @JsonKey(name: 'edited_at') final String? editedAt,
      @JsonKey(name: 'reply_to_id') final String? replyToId,
      @JsonKey(name: 'reply_to_content') final String? replyToContent,
      @JsonKey(name: 'reply_to_sender_name') final String? replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') final String? replyToSenderId,
      final List<MessageReaction> reactions,
      @JsonKey(name: 'deleted_at')
      final String? deletedAt}) = _$ChatMessageImpl;

  factory _ChatMessage.fromJson(Map<String, dynamic> json) =
      _$ChatMessageImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'conversation_id')
  String? get conversationId;
  @override
  @JsonKey(name: 'sender_id')
  String get senderId;
  @override
  @JsonKey(name: 'sender_name')
  String? get senderName;
  @override
  @JsonKey(name: 'sender_image')
  String? get senderImage;
  @override
  String get content;
  @override
  @JsonKey(name: 'message_type')
  String get messageType;
  @override
  @JsonKey(name: 'created_at')
  String get createdAt;
  @override
  @JsonKey(name: 'edited_at')
  String? get editedAt;
  @override // Reply support
  @JsonKey(name: 'reply_to_id')
  String? get replyToId;
  @override
  @JsonKey(name: 'reply_to_content')
  String? get replyToContent;
  @override
  @JsonKey(name: 'reply_to_sender_name')
  String? get replyToSenderName;
  @override
  @JsonKey(name: 'reply_to_sender_id')
  String? get replyToSenderId;
  @override // Reactions
  List<MessageReaction> get reactions;
  @override // Deletion
  @JsonKey(name: 'deleted_at')
  String? get deletedAt;
  @override
  @JsonKey(ignore: true)
  _$$ChatMessageImplCopyWith<_$ChatMessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
