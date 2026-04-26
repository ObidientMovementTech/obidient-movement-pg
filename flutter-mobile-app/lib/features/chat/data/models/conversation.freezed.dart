// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'conversation.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Conversation _$ConversationFromJson(Map<String, dynamic> json) {
  return _Conversation.fromJson(json);
}

/// @nodoc
mixin _$Conversation {
  String get id => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_message_at')
  String? get lastMessageAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_message_preview')
  String? get lastMessagePreview => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'unread_count')
  int get unreadCount => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_read_at')
  String? get lastReadAt =>
      throw _privateConstructorUsedError; // Other participant info (for direct chats)
  @JsonKey(name: 'participant_id')
  String? get participantId => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_name')
  String? get participantName => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_email')
  String? get participantEmail => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_image')
  String? get participantImage => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_designation')
  String? get participantDesignation => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_assigned_state')
  String? get participantAssignedState => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_assigned_lga')
  String? get participantAssignedLga => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_assigned_ward')
  String? get participantAssignedWard => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_voting_state')
  String? get participantVotingState => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_voting_lga')
  String? get participantVotingLga => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_voting_ward')
  String? get participantVotingWard => throw _privateConstructorUsedError;
  @JsonKey(name: 'participant_voting_pu')
  String? get participantVotingPu => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ConversationCopyWith<Conversation> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ConversationCopyWith<$Res> {
  factory $ConversationCopyWith(
          Conversation value, $Res Function(Conversation) then) =
      _$ConversationCopyWithImpl<$Res, Conversation>;
  @useResult
  $Res call(
      {String id,
      String type,
      @JsonKey(name: 'last_message_at') String? lastMessageAt,
      @JsonKey(name: 'last_message_preview') String? lastMessagePreview,
      @JsonKey(name: 'created_at') String? createdAt,
      @JsonKey(name: 'unread_count') int unreadCount,
      @JsonKey(name: 'last_read_at') String? lastReadAt,
      @JsonKey(name: 'participant_id') String? participantId,
      @JsonKey(name: 'participant_name') String? participantName,
      @JsonKey(name: 'participant_email') String? participantEmail,
      @JsonKey(name: 'participant_image') String? participantImage,
      @JsonKey(name: 'participant_designation') String? participantDesignation,
      @JsonKey(name: 'participant_assigned_state')
      String? participantAssignedState,
      @JsonKey(name: 'participant_assigned_lga') String? participantAssignedLga,
      @JsonKey(name: 'participant_assigned_ward')
      String? participantAssignedWard,
      @JsonKey(name: 'participant_voting_state') String? participantVotingState,
      @JsonKey(name: 'participant_voting_lga') String? participantVotingLga,
      @JsonKey(name: 'participant_voting_ward') String? participantVotingWard,
      @JsonKey(name: 'participant_voting_pu') String? participantVotingPu});
}

/// @nodoc
class _$ConversationCopyWithImpl<$Res, $Val extends Conversation>
    implements $ConversationCopyWith<$Res> {
  _$ConversationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? lastMessageAt = freezed,
    Object? lastMessagePreview = freezed,
    Object? createdAt = freezed,
    Object? unreadCount = null,
    Object? lastReadAt = freezed,
    Object? participantId = freezed,
    Object? participantName = freezed,
    Object? participantEmail = freezed,
    Object? participantImage = freezed,
    Object? participantDesignation = freezed,
    Object? participantAssignedState = freezed,
    Object? participantAssignedLga = freezed,
    Object? participantAssignedWard = freezed,
    Object? participantVotingState = freezed,
    Object? participantVotingLga = freezed,
    Object? participantVotingWard = freezed,
    Object? participantVotingPu = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      lastMessageAt: freezed == lastMessageAt
          ? _value.lastMessageAt
          : lastMessageAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessagePreview: freezed == lastMessagePreview
          ? _value.lastMessagePreview
          : lastMessagePreview // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      unreadCount: null == unreadCount
          ? _value.unreadCount
          : unreadCount // ignore: cast_nullable_to_non_nullable
              as int,
      lastReadAt: freezed == lastReadAt
          ? _value.lastReadAt
          : lastReadAt // ignore: cast_nullable_to_non_nullable
              as String?,
      participantId: freezed == participantId
          ? _value.participantId
          : participantId // ignore: cast_nullable_to_non_nullable
              as String?,
      participantName: freezed == participantName
          ? _value.participantName
          : participantName // ignore: cast_nullable_to_non_nullable
              as String?,
      participantEmail: freezed == participantEmail
          ? _value.participantEmail
          : participantEmail // ignore: cast_nullable_to_non_nullable
              as String?,
      participantImage: freezed == participantImage
          ? _value.participantImage
          : participantImage // ignore: cast_nullable_to_non_nullable
              as String?,
      participantDesignation: freezed == participantDesignation
          ? _value.participantDesignation
          : participantDesignation // ignore: cast_nullable_to_non_nullable
              as String?,
      participantAssignedState: freezed == participantAssignedState
          ? _value.participantAssignedState
          : participantAssignedState // ignore: cast_nullable_to_non_nullable
              as String?,
      participantAssignedLga: freezed == participantAssignedLga
          ? _value.participantAssignedLga
          : participantAssignedLga // ignore: cast_nullable_to_non_nullable
              as String?,
      participantAssignedWard: freezed == participantAssignedWard
          ? _value.participantAssignedWard
          : participantAssignedWard // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingState: freezed == participantVotingState
          ? _value.participantVotingState
          : participantVotingState // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingLga: freezed == participantVotingLga
          ? _value.participantVotingLga
          : participantVotingLga // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingWard: freezed == participantVotingWard
          ? _value.participantVotingWard
          : participantVotingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingPu: freezed == participantVotingPu
          ? _value.participantVotingPu
          : participantVotingPu // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ConversationImplCopyWith<$Res>
    implements $ConversationCopyWith<$Res> {
  factory _$$ConversationImplCopyWith(
          _$ConversationImpl value, $Res Function(_$ConversationImpl) then) =
      __$$ConversationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String type,
      @JsonKey(name: 'last_message_at') String? lastMessageAt,
      @JsonKey(name: 'last_message_preview') String? lastMessagePreview,
      @JsonKey(name: 'created_at') String? createdAt,
      @JsonKey(name: 'unread_count') int unreadCount,
      @JsonKey(name: 'last_read_at') String? lastReadAt,
      @JsonKey(name: 'participant_id') String? participantId,
      @JsonKey(name: 'participant_name') String? participantName,
      @JsonKey(name: 'participant_email') String? participantEmail,
      @JsonKey(name: 'participant_image') String? participantImage,
      @JsonKey(name: 'participant_designation') String? participantDesignation,
      @JsonKey(name: 'participant_assigned_state')
      String? participantAssignedState,
      @JsonKey(name: 'participant_assigned_lga') String? participantAssignedLga,
      @JsonKey(name: 'participant_assigned_ward')
      String? participantAssignedWard,
      @JsonKey(name: 'participant_voting_state') String? participantVotingState,
      @JsonKey(name: 'participant_voting_lga') String? participantVotingLga,
      @JsonKey(name: 'participant_voting_ward') String? participantVotingWard,
      @JsonKey(name: 'participant_voting_pu') String? participantVotingPu});
}

/// @nodoc
class __$$ConversationImplCopyWithImpl<$Res>
    extends _$ConversationCopyWithImpl<$Res, _$ConversationImpl>
    implements _$$ConversationImplCopyWith<$Res> {
  __$$ConversationImplCopyWithImpl(
      _$ConversationImpl _value, $Res Function(_$ConversationImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? lastMessageAt = freezed,
    Object? lastMessagePreview = freezed,
    Object? createdAt = freezed,
    Object? unreadCount = null,
    Object? lastReadAt = freezed,
    Object? participantId = freezed,
    Object? participantName = freezed,
    Object? participantEmail = freezed,
    Object? participantImage = freezed,
    Object? participantDesignation = freezed,
    Object? participantAssignedState = freezed,
    Object? participantAssignedLga = freezed,
    Object? participantAssignedWard = freezed,
    Object? participantVotingState = freezed,
    Object? participantVotingLga = freezed,
    Object? participantVotingWard = freezed,
    Object? participantVotingPu = freezed,
  }) {
    return _then(_$ConversationImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      lastMessageAt: freezed == lastMessageAt
          ? _value.lastMessageAt
          : lastMessageAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessagePreview: freezed == lastMessagePreview
          ? _value.lastMessagePreview
          : lastMessagePreview // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      unreadCount: null == unreadCount
          ? _value.unreadCount
          : unreadCount // ignore: cast_nullable_to_non_nullable
              as int,
      lastReadAt: freezed == lastReadAt
          ? _value.lastReadAt
          : lastReadAt // ignore: cast_nullable_to_non_nullable
              as String?,
      participantId: freezed == participantId
          ? _value.participantId
          : participantId // ignore: cast_nullable_to_non_nullable
              as String?,
      participantName: freezed == participantName
          ? _value.participantName
          : participantName // ignore: cast_nullable_to_non_nullable
              as String?,
      participantEmail: freezed == participantEmail
          ? _value.participantEmail
          : participantEmail // ignore: cast_nullable_to_non_nullable
              as String?,
      participantImage: freezed == participantImage
          ? _value.participantImage
          : participantImage // ignore: cast_nullable_to_non_nullable
              as String?,
      participantDesignation: freezed == participantDesignation
          ? _value.participantDesignation
          : participantDesignation // ignore: cast_nullable_to_non_nullable
              as String?,
      participantAssignedState: freezed == participantAssignedState
          ? _value.participantAssignedState
          : participantAssignedState // ignore: cast_nullable_to_non_nullable
              as String?,
      participantAssignedLga: freezed == participantAssignedLga
          ? _value.participantAssignedLga
          : participantAssignedLga // ignore: cast_nullable_to_non_nullable
              as String?,
      participantAssignedWard: freezed == participantAssignedWard
          ? _value.participantAssignedWard
          : participantAssignedWard // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingState: freezed == participantVotingState
          ? _value.participantVotingState
          : participantVotingState // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingLga: freezed == participantVotingLga
          ? _value.participantVotingLga
          : participantVotingLga // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingWard: freezed == participantVotingWard
          ? _value.participantVotingWard
          : participantVotingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      participantVotingPu: freezed == participantVotingPu
          ? _value.participantVotingPu
          : participantVotingPu // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ConversationImpl implements _Conversation {
  const _$ConversationImpl(
      {required this.id,
      this.type = 'direct',
      @JsonKey(name: 'last_message_at') this.lastMessageAt,
      @JsonKey(name: 'last_message_preview') this.lastMessagePreview,
      @JsonKey(name: 'created_at') this.createdAt,
      @JsonKey(name: 'unread_count') this.unreadCount = 0,
      @JsonKey(name: 'last_read_at') this.lastReadAt,
      @JsonKey(name: 'participant_id') this.participantId,
      @JsonKey(name: 'participant_name') this.participantName,
      @JsonKey(name: 'participant_email') this.participantEmail,
      @JsonKey(name: 'participant_image') this.participantImage,
      @JsonKey(name: 'participant_designation') this.participantDesignation,
      @JsonKey(name: 'participant_assigned_state')
      this.participantAssignedState,
      @JsonKey(name: 'participant_assigned_lga') this.participantAssignedLga,
      @JsonKey(name: 'participant_assigned_ward') this.participantAssignedWard,
      @JsonKey(name: 'participant_voting_state') this.participantVotingState,
      @JsonKey(name: 'participant_voting_lga') this.participantVotingLga,
      @JsonKey(name: 'participant_voting_ward') this.participantVotingWard,
      @JsonKey(name: 'participant_voting_pu') this.participantVotingPu});

  factory _$ConversationImpl.fromJson(Map<String, dynamic> json) =>
      _$$ConversationImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey()
  final String type;
  @override
  @JsonKey(name: 'last_message_at')
  final String? lastMessageAt;
  @override
  @JsonKey(name: 'last_message_preview')
  final String? lastMessagePreview;
  @override
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @override
  @JsonKey(name: 'unread_count')
  final int unreadCount;
  @override
  @JsonKey(name: 'last_read_at')
  final String? lastReadAt;
// Other participant info (for direct chats)
  @override
  @JsonKey(name: 'participant_id')
  final String? participantId;
  @override
  @JsonKey(name: 'participant_name')
  final String? participantName;
  @override
  @JsonKey(name: 'participant_email')
  final String? participantEmail;
  @override
  @JsonKey(name: 'participant_image')
  final String? participantImage;
  @override
  @JsonKey(name: 'participant_designation')
  final String? participantDesignation;
  @override
  @JsonKey(name: 'participant_assigned_state')
  final String? participantAssignedState;
  @override
  @JsonKey(name: 'participant_assigned_lga')
  final String? participantAssignedLga;
  @override
  @JsonKey(name: 'participant_assigned_ward')
  final String? participantAssignedWard;
  @override
  @JsonKey(name: 'participant_voting_state')
  final String? participantVotingState;
  @override
  @JsonKey(name: 'participant_voting_lga')
  final String? participantVotingLga;
  @override
  @JsonKey(name: 'participant_voting_ward')
  final String? participantVotingWard;
  @override
  @JsonKey(name: 'participant_voting_pu')
  final String? participantVotingPu;

  @override
  String toString() {
    return 'Conversation(id: $id, type: $type, lastMessageAt: $lastMessageAt, lastMessagePreview: $lastMessagePreview, createdAt: $createdAt, unreadCount: $unreadCount, lastReadAt: $lastReadAt, participantId: $participantId, participantName: $participantName, participantEmail: $participantEmail, participantImage: $participantImage, participantDesignation: $participantDesignation, participantAssignedState: $participantAssignedState, participantAssignedLga: $participantAssignedLga, participantAssignedWard: $participantAssignedWard, participantVotingState: $participantVotingState, participantVotingLga: $participantVotingLga, participantVotingWard: $participantVotingWard, participantVotingPu: $participantVotingPu)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ConversationImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.lastMessageAt, lastMessageAt) ||
                other.lastMessageAt == lastMessageAt) &&
            (identical(other.lastMessagePreview, lastMessagePreview) ||
                other.lastMessagePreview == lastMessagePreview) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.unreadCount, unreadCount) ||
                other.unreadCount == unreadCount) &&
            (identical(other.lastReadAt, lastReadAt) ||
                other.lastReadAt == lastReadAt) &&
            (identical(other.participantId, participantId) ||
                other.participantId == participantId) &&
            (identical(other.participantName, participantName) ||
                other.participantName == participantName) &&
            (identical(other.participantEmail, participantEmail) ||
                other.participantEmail == participantEmail) &&
            (identical(other.participantImage, participantImage) ||
                other.participantImage == participantImage) &&
            (identical(other.participantDesignation, participantDesignation) ||
                other.participantDesignation == participantDesignation) &&
            (identical(
                    other.participantAssignedState, participantAssignedState) ||
                other.participantAssignedState == participantAssignedState) &&
            (identical(other.participantAssignedLga, participantAssignedLga) ||
                other.participantAssignedLga == participantAssignedLga) &&
            (identical(
                    other.participantAssignedWard, participantAssignedWard) ||
                other.participantAssignedWard == participantAssignedWard) &&
            (identical(other.participantVotingState, participantVotingState) ||
                other.participantVotingState == participantVotingState) &&
            (identical(other.participantVotingLga, participantVotingLga) ||
                other.participantVotingLga == participantVotingLga) &&
            (identical(other.participantVotingWard, participantVotingWard) ||
                other.participantVotingWard == participantVotingWard) &&
            (identical(other.participantVotingPu, participantVotingPu) ||
                other.participantVotingPu == participantVotingPu));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        type,
        lastMessageAt,
        lastMessagePreview,
        createdAt,
        unreadCount,
        lastReadAt,
        participantId,
        participantName,
        participantEmail,
        participantImage,
        participantDesignation,
        participantAssignedState,
        participantAssignedLga,
        participantAssignedWard,
        participantVotingState,
        participantVotingLga,
        participantVotingWard,
        participantVotingPu
      ]);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ConversationImplCopyWith<_$ConversationImpl> get copyWith =>
      __$$ConversationImplCopyWithImpl<_$ConversationImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ConversationImplToJson(
      this,
    );
  }
}

abstract class _Conversation implements Conversation {
  const factory _Conversation(
      {required final String id,
      final String type,
      @JsonKey(name: 'last_message_at') final String? lastMessageAt,
      @JsonKey(name: 'last_message_preview') final String? lastMessagePreview,
      @JsonKey(name: 'created_at') final String? createdAt,
      @JsonKey(name: 'unread_count') final int unreadCount,
      @JsonKey(name: 'last_read_at') final String? lastReadAt,
      @JsonKey(name: 'participant_id') final String? participantId,
      @JsonKey(name: 'participant_name') final String? participantName,
      @JsonKey(name: 'participant_email') final String? participantEmail,
      @JsonKey(name: 'participant_image') final String? participantImage,
      @JsonKey(name: 'participant_designation')
      final String? participantDesignation,
      @JsonKey(name: 'participant_assigned_state')
      final String? participantAssignedState,
      @JsonKey(name: 'participant_assigned_lga')
      final String? participantAssignedLga,
      @JsonKey(name: 'participant_assigned_ward')
      final String? participantAssignedWard,
      @JsonKey(name: 'participant_voting_state')
      final String? participantVotingState,
      @JsonKey(name: 'participant_voting_lga')
      final String? participantVotingLga,
      @JsonKey(name: 'participant_voting_ward')
      final String? participantVotingWard,
      @JsonKey(name: 'participant_voting_pu')
      final String? participantVotingPu}) = _$ConversationImpl;

  factory _Conversation.fromJson(Map<String, dynamic> json) =
      _$ConversationImpl.fromJson;

  @override
  String get id;
  @override
  String get type;
  @override
  @JsonKey(name: 'last_message_at')
  String? get lastMessageAt;
  @override
  @JsonKey(name: 'last_message_preview')
  String? get lastMessagePreview;
  @override
  @JsonKey(name: 'created_at')
  String? get createdAt;
  @override
  @JsonKey(name: 'unread_count')
  int get unreadCount;
  @override
  @JsonKey(name: 'last_read_at')
  String? get lastReadAt;
  @override // Other participant info (for direct chats)
  @JsonKey(name: 'participant_id')
  String? get participantId;
  @override
  @JsonKey(name: 'participant_name')
  String? get participantName;
  @override
  @JsonKey(name: 'participant_email')
  String? get participantEmail;
  @override
  @JsonKey(name: 'participant_image')
  String? get participantImage;
  @override
  @JsonKey(name: 'participant_designation')
  String? get participantDesignation;
  @override
  @JsonKey(name: 'participant_assigned_state')
  String? get participantAssignedState;
  @override
  @JsonKey(name: 'participant_assigned_lga')
  String? get participantAssignedLga;
  @override
  @JsonKey(name: 'participant_assigned_ward')
  String? get participantAssignedWard;
  @override
  @JsonKey(name: 'participant_voting_state')
  String? get participantVotingState;
  @override
  @JsonKey(name: 'participant_voting_lga')
  String? get participantVotingLga;
  @override
  @JsonKey(name: 'participant_voting_ward')
  String? get participantVotingWard;
  @override
  @JsonKey(name: 'participant_voting_pu')
  String? get participantVotingPu;
  @override
  @JsonKey(ignore: true)
  _$$ConversationImplCopyWith<_$ConversationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
