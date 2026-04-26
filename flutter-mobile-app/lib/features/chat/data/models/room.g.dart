// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RoomImpl _$$RoomImplFromJson(Map<String, dynamic> json) => _$RoomImpl(
      id: json['id'] as String,
      title: json['title'] as String?,
      roomLevel: json['room_level'] as String?,
      roomState: json['room_state'] as String?,
      roomLga: json['room_lga'] as String?,
      roomWard: json['room_ward'] as String?,
      roomPu: json['room_pu'] as String?,
      icon: json['icon'] as String?,
      memberCount: (json['member_count'] as num?)?.toInt() ?? 0,
      unreadCount: (json['unread_count'] as num?)?.toInt() ?? 0,
      lastReadAt: json['last_read_at'] as String?,
      lastMessageAt: json['last_message_at'] as String?,
      lastMessagePreview: json['last_message_preview'] as String?,
    );

Map<String, dynamic> _$$RoomImplToJson(_$RoomImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'room_level': instance.roomLevel,
      'room_state': instance.roomState,
      'room_lga': instance.roomLga,
      'room_ward': instance.roomWard,
      'room_pu': instance.roomPu,
      'icon': instance.icon,
      'member_count': instance.memberCount,
      'unread_count': instance.unreadCount,
      'last_read_at': instance.lastReadAt,
      'last_message_at': instance.lastMessageAt,
      'last_message_preview': instance.lastMessagePreview,
    };
