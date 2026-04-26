import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/reaction_counts.dart';
import '../providers/feeds_providers.dart';

/// Compact emoji reaction bar — 👍 ❤️ 😊 😐
/// Shows each emoji with its count. Tapping toggles the user's reaction.
class ReactionBar extends ConsumerStatefulWidget {
  final String targetType;
  final String targetId;
  final ReactionCounts? initialCounts;
  final String? initialUserReaction;

  const ReactionBar({
    super.key,
    required this.targetType,
    required this.targetId,
    this.initialCounts,
    this.initialUserReaction,
  });

  @override
  ConsumerState<ReactionBar> createState() => _ReactionBarState();
}

class _ReactionBarState extends ConsumerState<ReactionBar> {
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    // Defer provider seeding to after the build phase
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _seedIfNeeded();
    });
  }

  void _seedIfNeeded() {
    if (_initialized) return;
    _initialized = true;
    final key = '${widget.targetType}:${widget.targetId}';
    final existing = ref.read(reactionStateProvider(key));
    if (existing == null) {
      ref.read(reactionStateProvider(key).notifier).state = ReactionState(
        counts: widget.initialCounts ?? const ReactionCounts(),
        userReaction: widget.initialUserReaction,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final key = '${widget.targetType}:${widget.targetId}';
    final state = ref.watch(reactionStateProvider(key));
    final counts = state?.counts ?? widget.initialCounts ?? const ReactionCounts();
    final userReaction = state?.userReaction ?? widget.initialUserReaction;

    return Row(
      children: [
        _ReactionChip(
          emoji: '👍',
          count: counts.like,
          isSelected: userReaction == 'like',
          theme: theme,
          onTap: () => _react('like'),
        ),
        const SizedBox(width: 6),
        _ReactionChip(
          emoji: '❤️',
          count: counts.love,
          isSelected: userReaction == 'love',
          theme: theme,
          onTap: () => _react('love'),
        ),
        const SizedBox(width: 6),
        _ReactionChip(
          emoji: '😊',
          count: counts.smile,
          isSelected: userReaction == 'smile',
          theme: theme,
          onTap: () => _react('smile'),
        ),
        const SizedBox(width: 6),
        _ReactionChip(
          emoji: '😐',
          count: counts.meh,
          isSelected: userReaction == 'meh',
          theme: theme,
          onTap: () => _react('meh'),
        ),
      ],
    );
  }

  void _react(String reactionType) {
    HapticFeedback.lightImpact();
    toggleReaction(
      ref,
      targetType: widget.targetType,
      targetId: widget.targetId,
      reactionType: reactionType,
    );
  }
}

class _ReactionChip extends StatelessWidget {
  final String emoji;
  final int count;
  final bool isSelected;
  final ThemeData theme;
  final VoidCallback onTap;

  const _ReactionChip({
    required this.emoji,
    required this.count,
    required this.isSelected,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final selectedColor = theme.colorScheme.primary.withOpacity(0.12);
    final borderColor = isSelected
        ? theme.colorScheme.primary.withOpacity(0.4)
        : theme.colorScheme.outline.withOpacity(0.1);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? selectedColor
              : theme.colorScheme.onSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 14)),
            if (count > 0) ...[
              const SizedBox(width: 4),
              Text(
                _formatCount(count),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected
                      ? theme.colorScheme.primary
                      : theme.colorScheme.onSurface.withOpacity(0.4),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatCount(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}
