import 'package:freezed_annotation/freezed_annotation.dart';

part 'chat_contact.freezed.dart';
part 'chat_contact.g.dart';

@freezed
class ChatContact with _$ChatContact {
  const factory ChatContact({
    required String id,
    required String name,
    String? email,
    String? phone,
    @JsonKey(name: 'profileImage') String? profileImage,
    String? designation,
    String? level,
  }) = _ChatContact;

  factory ChatContact.fromJson(Map<String, dynamic> json) =>
      _$ChatContactFromJson(json);
}

@freezed
class ChatContacts with _$ChatContacts {
  const factory ChatContacts({
    @Default([]) List<ChatContact> coordinators,
    @Default([]) List<ChatContact> subordinates,
  }) = _ChatContacts;

  factory ChatContacts.fromJson(Map<String, dynamic> json) =>
      _$ChatContactsFromJson(json);
}
