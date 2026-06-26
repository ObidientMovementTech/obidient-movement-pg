import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/analytics_models.dart';
import '../providers/analytics_providers.dart';
import 'person_profile_sheet.dart';

class PeopleListWidget extends ConsumerStatefulWidget {
  final String level;
  final String locationId;
  final String? locationName;
  final PeopleFilters initialFilters;

  const PeopleListWidget({
    super.key,
    required this.level,
    required this.locationId,
    this.locationName,
    this.initialFilters = const PeopleFilters(),
  });

  @override
  ConsumerState<PeopleListWidget> createState() => _PeopleListWidgetState();
}

class _PeopleListWidgetState extends ConsumerState<PeopleListWidget> {
  late TextEditingController _searchCtrl;
  late PeopleParams _params;

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController();
    _params = (level: widget.level, locationId: widget.locationId, locationName: widget.locationName);
    // Load initial data after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final notifier = ref.read(peopleProvider(_params).notifier);
      if (widget.initialFilters != const PeopleFilters()) {
        notifier.applyFilters(widget.initialFilters);
      } else {
        notifier.loadPage(1);
      }
    });
  }

  @override
  void didUpdateWidget(PeopleListWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialFilters != widget.initialFilters) {
      ref.read(peopleProvider(_params).notifier).applyFilters(widget.initialFilters);
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(peopleProvider(_params));
    final notifier = ref.read(peopleProvider(_params).notifier);
    final onSurface = theme.colorScheme.onSurface;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            controller: _searchCtrl,
            onChanged: (v) {
              Future.delayed(const Duration(milliseconds: 300), () {
                if (_searchCtrl.text == v) {
                  notifier.applyFilters(state.filters.copyWith(search: v.isEmpty ? null : v));
                }
              });
            },
            style: TextStyle(fontSize: 13, color: onSurface),
            decoration: InputDecoration(
              hintText: 'Search name or phone…',
              hintStyle: TextStyle(color: onSurface.withOpacity(0.3), fontSize: 13),
              prefixIcon: Icon(Icons.search_rounded, size: 18, color: onSurface.withOpacity(0.3)),
              filled: true,
              fillColor: onSurface.withOpacity(0.04),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Filter chips
        _FilterChips(
          filters: state.filters,
          onChanged: (f) => notifier.applyFilters(f),
        ),
        const SizedBox(height: 8),

        // Results count + pagination
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Text(
                state.loading ? 'Loading…' : '${state.pagination.total} members',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: onSurface.withOpacity(0.4)),
              ),
              const Spacer(),
              if (state.pagination.totalPages > 1) ...[
                GestureDetector(
                  onTap: state.pagination.page > 1 ? () { HapticFeedback.lightImpact(); notifier.prevPage(); } : null,
                  child: Icon(Icons.chevron_left_rounded, size: 20,
                    color: state.pagination.page > 1 ? onSurface : onSurface.withOpacity(0.2)),
                ),
                Text('${state.pagination.page}/${state.pagination.totalPages}',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: onSurface)),
                GestureDetector(
                  onTap: state.pagination.page < state.pagination.totalPages ? () { HapticFeedback.lightImpact(); notifier.nextPage(); } : null,
                  child: Icon(Icons.chevron_right_rounded, size: 20,
                    color: state.pagination.page < state.pagination.totalPages ? onSurface : onSurface.withOpacity(0.2)),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 8),

        // People list
        if (state.loading)
          _buildSkeleton(theme)
        else if (state.people.isEmpty)
          Padding(
            padding: const EdgeInsets.all(32),
            child: Center(child: Text('No members match filters',
              style: TextStyle(fontSize: 13, color: onSurface.withOpacity(0.4)))),
          )
        else
          ...state.people.map((person) => _PersonCard(
            person: person,
            theme: theme,
            onTap: () => showPersonProfileSheet(context, person),
          )),
      ],
    );
  }

  Widget _buildSkeleton(ThemeData theme) {
    return Shimmer.fromColors(
      baseColor: theme.colorScheme.onSurface.withOpacity(0.06),
      highlightColor: theme.colorScheme.onSurface.withOpacity(0.02),
      child: Column(
        children: List.generate(5, (_) => Container(
          height: 64,
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
          ),
        )),
      ),
    );
  }
}

// ── Person Card ─────────────────────────────────────────────

class _PersonCard extends StatelessWidget {
  final PersonRow person;
  final ThemeData theme;
  final VoidCallback onTap;

  const _PersonCard({required this.person, required this.theme, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final onSurface = theme.colorScheme.onSurface;
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      behavior: HitTestBehavior.opaque,
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: theme.colorScheme.outline.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            // Name + phone
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    person.name ?? 'Unknown',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: onSurface),
                    maxLines: 1, overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    person.phone ?? '—',
                    style: TextStyle(fontSize: 11, color: onSurface.withOpacity(0.4), fontFamily: 'monospace'),
                  ),
                ],
              ),
            ),
            // Gender badge
            if (person.gender != null && person.gender!.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  color: person.gender == 'Male'
                      ? const Color(0xFF3b82f6).withOpacity(0.1)
                      : const Color(0xFFec4899).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  person.gender == 'Male' ? 'M' : 'F',
                  style: TextStyle(
                    fontSize: 9, fontWeight: FontWeight.w700,
                    color: person.gender == 'Male' ? const Color(0xFF3b82f6) : const Color(0xFFec4899),
                  ),
                ),
              ),
            // PVC badge
            Icon(
              person.isVoter == 'Yes' ? Icons.check_circle : Icons.cancel,
              size: 16,
              color: person.isVoter == 'Yes' ? AppColors.primary : const Color(0xFFef4444).withOpacity(0.5),
            ),
            const SizedBox(width: 4),
            Icon(Icons.chevron_right_rounded, size: 16, color: onSurface.withOpacity(0.2)),
          ],
        ),
      ),
    );
  }
}

// ── Filter Chips ────────────────────────────────────────────

class _FilterChips extends StatelessWidget {
  final PeopleFilters filters;
  final ValueChanged<PeopleFilters> onChanged;

  const _FilterChips({required this.filters, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activeFilters = <String>[];
    if (filters.gender != null) activeFilters.add('Gender: ${filters.gender}');
    if (filters.ageRange != null) activeFilters.add('Age: ${filters.ageRange}');
    if (filters.pvc != null) activeFilters.add('PVC: ${filters.pvc}');
    if (filters.willVote != null) activeFilters.add('Vote: ${filters.willVote}');
    if (filters.profileHealth != null) activeFilters.add('Profile: ${filters.profileHealth}');
    if (filters.activity != null) activeFilters.add('Activity: ${filters.activity}');

    if (activeFilters.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 30,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          ...activeFilters.map((label) => Padding(
            padding: const EdgeInsets.only(right: 6),
            child: Chip(
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
              padding: EdgeInsets.zero,
              labelPadding: const EdgeInsets.symmetric(horizontal: 6),
              backgroundColor: AppColors.primary.withOpacity(0.1),
              side: BorderSide.none,
              label: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary)),
            ),
          )),
          GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              onChanged(const PeopleFilters());
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.05),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text('Clear all', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              )),
            ),
          ),
        ],
      ),
    );
  }
}
