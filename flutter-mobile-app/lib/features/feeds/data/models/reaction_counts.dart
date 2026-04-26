import 'package:freezed_annotation/freezed_annotation.dart';

part 'reaction_counts.freezed.dart';
part 'reaction_counts.g.dart';

@freezed
class ReactionCounts with _$ReactionCounts {
  const factory ReactionCounts({
    @Default(0) int like,
    @Default(0) int love,
    @Default(0) int smile,
    @Default(0) int meh,
    @Default(0) int total,
  }) = _ReactionCounts;

  factory ReactionCounts.fromJson(Map<String, dynamic> json) =>
      _$ReactionCountsFromJson(json);
}
