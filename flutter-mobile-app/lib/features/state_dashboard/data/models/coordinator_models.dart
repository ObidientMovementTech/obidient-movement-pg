import 'package:freezed_annotation/freezed_annotation.dart';

part 'coordinator_models.freezed.dart';
part 'coordinator_models.g.dart';

/// A user returned from coordinator search.
@freezed
class SearchedUser with _$SearchedUser {
  const factory SearchedUser({
    required String id,
    required String name,
    String? email,
    String? phone,
    String? profileImage,
    String? designation,
    String? assignedState,
    String? assignedLGA,
    String? assignedWard,
  }) = _SearchedUser;

  factory SearchedUser.fromJson(Map<String, dynamic> json) =>
      _$SearchedUserFromJson(json);
}

/// A location item from /api/nigeria-locations endpoints.
@freezed
class NigeriaLocation with _$NigeriaLocation {
  const factory NigeriaLocation({
    required int id,
    required String name,
    String? abbreviation,
    String? level,
    @JsonKey(name: 'parent_id') int? parentId,
    @JsonKey(name: 'source_id') String? sourceId,
    @JsonKey(name: 'parent_name') String? parentName,
  }) = _NigeriaLocation;

  factory NigeriaLocation.fromJson(Map<String, dynamic> json) =>
      _$NigeriaLocationFromJson(json);
}
