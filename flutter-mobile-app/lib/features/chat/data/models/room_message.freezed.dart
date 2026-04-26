// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'room_message.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

RoomMessage _$RoomMessageFromJson(Map<String, dynamic> json) {
  return _RoomMessage.fromJson(json);
}

/// @nodoc
mixin _$RoomMessage {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'conversation_id')
  String? get conversationId => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_id')
  String get senderId => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_name')
  String? get senderName => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_image')
  String? get senderImage => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_designation')
  String? get senderDesignation => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_assigned_state')
  String? get senderAssignedState => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_assigned_lga')
  String? get senderAssignedLga => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_assigned_ward')
  String? get senderAssignedWard => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_voting_state')
  String? get senderVotingState => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_voting_lga')
  String? get senderVotingLga => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_voting_ward')
  String? get senderVotingWard => throw _privateConstructorUsedError;
  @JsonKey(name: 'sender_voting_pu')
  String? get senderVotingPu => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  @JsonKey(name: 'message_type')
  String get messageType => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_pinned')
  bool get isPinned => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_deleted')
  bool get isDeleted => throw _privateConstructorUsedError; // Reply support
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
  $RoomMessageCopyWith<RoomMessage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RoomMessageCopyWith<$Res> {
  factory $RoomMessageCopyWith(
          RoomMessage value, $Res Function(RoomMessage) then) =
      _$RoomMessageCopyWithImpl<$Res, RoomMessage>;
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'conversation_id') String? conversationId,
      @JsonKey(name: 'sender_id') String senderId,
      @JsonKey(name: 'sender_name') String? senderName,
      @JsonKey(name: 'sender_image') String? senderImage,
      @JsonKey(name: 'sender_designation') String? senderDesignation,
      @JsonKey(name: 'sender_assigned_state') String? senderAssignedState,
      @JsonKey(name: 'sender_assigned_lga') String? senderAssignedLga,
      @JsonKey(name: 'sender_assigned_ward') String? senderAssignedWard,
      @JsonKey(name: 'sender_voting_state') String? senderVotingState,
      @JsonKey(name: 'sender_voting_lga') String? senderVotingLga,
      @JsonKey(name: 'sender_voting_ward') String? senderVotingWard,
      @JsonKey(name: 'sender_voting_pu') String? senderVotingPu,
      String content,
      @JsonKey(name: 'message_type') String messageType,
      @JsonKey(name: 'created_at') String createdAt,
      @JsonKey(name: 'is_pinned') bool isPinned,
      @JsonKey(name: 'is_deleted') bool isDeleted,
      @JsonKey(name: 'reply_to_id') String? replyToId,
      @JsonKey(name: 'reply_to_content') String? replyToContent,
      @JsonKey(name: 'reply_to_sender_name') String? replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') String? replyToSenderId,
      List<MessageReaction> reactions,
      @JsonKey(name: 'deleted_at') String? deletedAt});
}

/// @nodoc
class _$RoomMessageCopyWithImpl<$Res, $Val extends RoomMessage>
    implements $RoomMessageCopyWith<$Res> {
  _$RoomMessageCopyWithImpl(this._value, this._then);

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
    Object? senderDesignation = freezed,
    Object? senderAssignedState = freezed,
    Object? senderAssignedLga = freezed,
    Object? senderAssignedWard = freezed,
    Object? senderVotingState = freezed,
    Object? senderVotingLga = freezed,
    Object? senderVotingWard = freezed,
    Object? senderVotingPu = freezed,
    Object? content = null,
    Object? messageType = null,
    Object? createdAt = null,
    Object? isPinned = null,
    Object? isDeleted = null,
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
      senderDesignation: freezed == senderDesignation
          ? _value.senderDesignation
          : senderDesignation // ignore: cast_nullable_to_non_nullable
              as String?,
      senderAssignedState: freezed == senderAssignedState
          ? _value.senderAssignedState
          : senderAssignedState // ignore: cast_nullable_to_non_nullable
              as String?,
      senderAssignedLga: freezed == senderAssignedLga
          ? _value.senderAssignedLga
          : senderAssignedLga // ignore: cast_nullable_to_non_nullable
              as String?,
      senderAssignedWard: freezed == senderAssignedWard
          ? _value.senderAssignedWard
          : senderAssignedWard // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingState: freezed == senderVotingState
          ? _value.senderVotingState
          : senderVotingState // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingLga: freezed == senderVotingLga
          ? _value.senderVotingLga
          : senderVotingLga // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingWard: freezed == senderVotingWard
          ? _value.senderVotingWard
          : senderVotingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingPu: freezed == senderVotingPu
          ? _value.senderVotingPu
          : senderVotingPu // ignore: cast_nullable_to_non_nullable
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
      isPinned: null == isPinned
          ? _value.isPinned
          : isPinned // ignore: cast_nullable_to_non_nullable
              as bool,
      isDeleted: null == isDeleted
          ? _value.isDeleted
          : isDeleted // ignore: cast_nullable_to_non_nullable
              as bool,
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
abstract class _$$RoomMessageImplCopyWith<$Res>
    implements $RoomMessageCopyWith<$Res> {
  factory _$$RoomMessageImplCopyWith(
          _$RoomMessageImpl value, $Res Function(_$RoomMessageImpl) then) =
      __$$RoomMessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'conversation_id') String? conversationId,
      @JsonKey(name: 'sender_id') String senderId,
      @JsonKey(name: 'sender_name') String? senderName,
      @JsonKey(name: 'sender_image') String? senderImage,
      @JsonKey(name: 'sender_designation') String? senderDesignation,
      @JsonKey(name: 'sender_assigned_state') String? senderAssignedState,
      @JsonKey(name: 'sender_assigned_lga') String? senderAssignedLga,
      @JsonKey(name: 'sender_assigned_ward') String? senderAssignedWard,
      @JsonKey(name: 'sender_voting_state') String? senderVotingState,
      @JsonKey(name: 'sender_voting_lga') String? senderVotingLga,
      @JsonKey(name: 'sender_voting_ward') String? senderVotingWard,
      @JsonKey(name: 'sender_voting_pu') String? senderVotingPu,
      String content,
      @JsonKey(name: 'message_type') String messageType,
      @JsonKey(name: 'created_at') String createdAt,
      @JsonKey(name: 'is_pinned') bool isPinned,
      @JsonKey(name: 'is_deleted') bool isDeleted,
      @JsonKey(name: 'reply_to_id') String? replyToId,
      @JsonKey(name: 'reply_to_content') String? replyToContent,
      @JsonKey(name: 'reply_to_sender_name') String? replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') String? replyToSenderId,
      List<MessageReaction> reactions,
      @JsonKey(name: 'deleted_at') String? deletedAt});
}

/// @nodoc
class __$$RoomMessageImplCopyWithImpl<$Res>
    extends _$RoomMessageCopyWithImpl<$Res, _$RoomMessageImpl>
    implements _$$RoomMessageImplCopyWith<$Res> {
  __$$RoomMessageImplCopyWithImpl(
      _$RoomMessageImpl _value, $Res Function(_$RoomMessageImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? conversationId = freezed,
    Object? senderId = null,
    Object? senderName = freezed,
    Object? senderImage = freezed,
    Object? senderDesignation = freezed,
    Object? senderAssignedState = freezed,
    Object? senderAssignedLga = freezed,
    Object? senderAssignedWard = freezed,
    Object? senderVotingState = freezed,
    Object? senderVotingLga = freezed,
    Object? senderVotingWard = freezed,
    Object? senderVotingPu = freezed,
    Object? content = null,
    Object? messageType = null,
    Object? createdAt = null,
    Object? isPinned = null,
    Object? isDeleted = null,
    Object? replyToId = freezed,
    Object? replyToContent = freezed,
    Object? replyToSenderName = freezed,
    Object? replyToSenderId = freezed,
    Object? reactions = null,
    Object? deletedAt = freezed,
  }) {
    return _then(_$RoomMessageImpl(
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
      senderDesignation: freezed == senderDesignation
          ? _value.senderDesignation
          : senderDesignation // ignore: cast_nullable_to_non_nullable
              as String?,
      senderAssignedState: freezed == senderAssignedState
          ? _value.senderAssignedState
          : senderAssignedState // ignore: cast_nullable_to_non_nullable
              as String?,
      senderAssignedLga: freezed == senderAssignedLga
          ? _value.senderAssignedLga
          : senderAssignedLga // ignore: cast_nullable_to_non_nullable
              as String?,
      senderAssignedWard: freezed == senderAssignedWard
          ? _value.senderAssignedWard
          : senderAssignedWard // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingState: freezed == senderVotingState
          ? _value.senderVotingState
          : senderVotingState // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingLga: freezed == senderVotingLga
          ? _value.senderVotingLga
          : senderVotingLga // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingWard: freezed == senderVotingWard
          ? _value.senderVotingWard
          : senderVotingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      senderVotingPu: freezed == senderVotingPu
          ? _value.senderVotingPu
          : senderVotingPu // ignore: cast_nullable_to_non_nullable
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
      isPinned: null == isPinned
          ? _value.isPinned
          : isPinned // ignore: cast_nullable_to_non_nullable
              as bool,
      isDeleted: null == isDeleted
          ? _value.isDeleted
          : isDeleted // ignore: cast_nullable_to_non_nullable
              as bool,
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
class _$RoomMessageImpl implements _RoomMessage {
  const _$RoomMessageImpl(
      {required this.id,
      @JsonKey(name: 'conversation_id') this.conversationId,
      @JsonKey(name: 'sender_id') required this.senderId,
      @JsonKey(name: 'sender_name') this.senderName,
      @JsonKey(name: 'sender_image') this.senderImage,
      @JsonKey(name: 'sender_designation') this.senderDesignation,
      @JsonKey(name: 'sender_assigned_state') this.senderAssignedState,
      @JsonKey(name: 'sender_assigned_lga') this.senderAssignedLga,
      @JsonKey(name: 'sender_assigned_ward') this.senderAssignedWard,
      @JsonKey(name: 'sender_voting_state') this.senderVotingState,
      @JsonKey(name: 'sender_voting_lga') this.senderVotingLga,
      @JsonKey(name: 'sender_voting_ward') this.senderVotingWard,
      @JsonKey(name: 'sender_voting_pu') this.senderVotingPu,
      required this.content,
      @JsonKey(name: 'message_type') this.messageType = 'text',
      @JsonKey(name: 'created_at') required this.createdAt,
      @JsonKey(name: 'is_pinned') this.isPinned = false,
      @JsonKey(name: 'is_deleted') this.isDeleted = false,
      @JsonKey(name: 'reply_to_id') this.replyToId,
      @JsonKey(name: 'reply_to_content') this.replyToContent,
      @JsonKey(name: 'reply_to_sender_name') this.replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') this.replyToSenderId,
      final List<MessageReaction> reactions = const [],
      @JsonKey(name: 'deleted_at') this.deletedAt})
      : _reactions = reactions;

  factory _$RoomMessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$RoomMessageImplFromJson(json);

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
  @JsonKey(name: 'sender_designation')
  final String? senderDesignation;
  @override
  @JsonKey(name: 'sender_assigned_state')
  final String? senderAssignedState;
  @override
  @JsonKey(name: 'sender_assigned_lga')
  final String? senderAssignedLga;
  @override
  @JsonKey(name: 'sender_assigned_ward')
  final String? senderAssignedWard;
  @override
  @JsonKey(name: 'sender_voting_state')
  final String? senderVotingState;
  @override
  @JsonKey(name: 'sender_voting_lga')
  final String? senderVotingLga;
  @override
  @JsonKey(name: 'sender_voting_ward')
  final String? senderVotingWard;
  @override
  @JsonKey(name: 'sender_voting_pu')
  final String? senderVotingPu;
  @override
  final String content;
  @override
  @JsonKey(name: 'message_type')
  final String messageType;
  @override
  @JsonKey(name: 'created_at')
  final String createdAt;
  @override
  @JsonKey(name: 'is_pinned')
  final bool isPinned;
  @override
  @JsonKey(name: 'is_deleted')
  final bool isDeleted;
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
    return 'RoomMessage(id: $id, conversationId: $conversationId, senderId: $senderId, senderName: $senderName, senderImage: $senderImage, senderDesignation: $senderDesignation, senderAssignedState: $senderAssignedState, senderAssignedLga: $senderAssignedLga, senderAssignedWard: $senderAssignedWard, senderVotingState: $senderVotingState, senderVotingLga: $senderVotingLga, senderVotingWard: $senderVotingWard, senderVotingPu: $senderVotingPu, content: $content, messageType: $messageType, createdAt: $createdAt, isPinned: $isPinned, isDeleted: $isDeleted, replyToId: $replyToId, replyToContent: $replyToContent, replyToSenderName: $replyToSenderName, replyToSenderId: $replyToSenderId, reactions: $reactions, deletedAt: $deletedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RoomMessageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.conversationId, conversationId) ||
                other.conversationId == conversationId) &&
            (identical(other.senderId, senderId) ||
                other.senderId == senderId) &&
            (identical(other.senderName, senderName) ||
                other.senderName == senderName) &&
            (identical(other.senderImage, senderImage) ||
                other.senderImage == senderImage) &&
            (identical(other.senderDesignation, senderDesignation) ||
                other.senderDesignation == senderDesignation) &&
            (identical(other.senderAssignedState, senderAssignedState) ||
                other.senderAssignedState == senderAssignedState) &&
            (identical(other.senderAssignedLga, senderAssignedLga) ||
                other.senderAssignedLga == senderAssignedLga) &&
            (identical(other.senderAssignedWard, senderAssignedWard) ||
                other.senderAssignedWard == senderAssignedWard) &&
            (identical(other.senderVotingState, senderVotingState) ||
                other.senderVotingState == senderVotingState) &&
            (identical(other.senderVotingLga, senderVotingLga) ||
                other.senderVotingLga == senderVotingLga) &&
            (identical(other.senderVotingWard, senderVotingWard) ||
                other.senderVotingWard == senderVotingWard) &&
            (identical(other.senderVotingPu, senderVotingPu) ||
                other.senderVotingPu == senderVotingPu) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.messageType, messageType) ||
                other.messageType == messageType) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.isPinned, isPinned) ||
                other.isPinned == isPinned) &&
            (identical(other.isDeleted, isDeleted) ||
                other.isDeleted == isDeleted) &&
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
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        conversationId,
        senderId,
        senderName,
        senderImage,
        senderDesignation,
        senderAssignedState,
        senderAssignedLga,
        senderAssignedWard,
        senderVotingState,
        senderVotingLga,
        senderVotingWard,
        senderVotingPu,
        content,
        messageType,
        createdAt,
        isPinned,
        isDeleted,
        replyToId,
        replyToContent,
        replyToSenderName,
        replyToSenderId,
        const DeepCollectionEquality().hash(_reactions),
        deletedAt
      ]);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$RoomMessageImplCopyWith<_$RoomMessageImpl> get copyWith =>
      __$$RoomMessageImplCopyWithImpl<_$RoomMessageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RoomMessageImplToJson(
      this,
    );
  }
}

abstract class _RoomMessage implements RoomMessage {
  const factory _RoomMessage(
      {required final String id,
      @JsonKey(name: 'conversation_id') final String? conversationId,
      @JsonKey(name: 'sender_id') required final String senderId,
      @JsonKey(name: 'sender_name') final String? senderName,
      @JsonKey(name: 'sender_image') final String? senderImage,
      @JsonKey(name: 'sender_designation') final String? senderDesignation,
      @JsonKey(name: 'sender_assigned_state') final String? senderAssignedState,
      @JsonKey(name: 'sender_assigned_lga') final String? senderAssignedLga,
      @JsonKey(name: 'sender_assigned_ward') final String? senderAssignedWard,
      @JsonKey(name: 'sender_voting_state') final String? senderVotingState,
      @JsonKey(name: 'sender_voting_lga') final String? senderVotingLga,
      @JsonKey(name: 'sender_voting_ward') final String? senderVotingWard,
      @JsonKey(name: 'sender_voting_pu') final String? senderVotingPu,
      required final String content,
      @JsonKey(name: 'message_type') final String messageType,
      @JsonKey(name: 'created_at') required final String createdAt,
      @JsonKey(name: 'is_pinned') final bool isPinned,
      @JsonKey(name: 'is_deleted') final bool isDeleted,
      @JsonKey(name: 'reply_to_id') final String? replyToId,
      @JsonKey(name: 'reply_to_content') final String? replyToContent,
      @JsonKey(name: 'reply_to_sender_name') final String? replyToSenderName,
      @JsonKey(name: 'reply_to_sender_id') final String? replyToSenderId,
      final List<MessageReaction> reactions,
      @JsonKey(name: 'deleted_at')
      final String? deletedAt}) = _$RoomMessageImpl;

  factory _RoomMessage.fromJson(Map<String, dynamic> json) =
      _$RoomMessageImpl.fromJson;

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
  @JsonKey(name: 'sender_designation')
  String? get senderDesignation;
  @override
  @JsonKey(name: 'sender_assigned_state')
  String? get senderAssignedState;
  @override
  @JsonKey(name: 'sender_assigned_lga')
  String? get senderAssignedLga;
  @override
  @JsonKey(name: 'sender_assigned_ward')
  String? get senderAssignedWard;
  @override
  @JsonKey(name: 'sender_voting_state')
  String? get senderVotingState;
  @override
  @JsonKey(name: 'sender_voting_lga')
  String? get senderVotingLga;
  @override
  @JsonKey(name: 'sender_voting_ward')
  String? get senderVotingWard;
  @override
  @JsonKey(name: 'sender_voting_pu')
  String? get senderVotingPu;
  @override
  String get content;
  @override
  @JsonKey(name: 'message_type')
  String get messageType;
  @override
  @JsonKey(name: 'created_at')
  String get createdAt;
  @override
  @JsonKey(name: 'is_pinned')
  bool get isPinned;
  @override
  @JsonKey(name: 'is_deleted')
  bool get isDeleted;
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
  _$$RoomMessageImplCopyWith<_$RoomMessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
