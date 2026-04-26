import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/coordinator_models.dart';
import '../providers/dashboard_providers.dart';

class AssignCoordinatorScreen extends ConsumerStatefulWidget {
  const AssignCoordinatorScreen({super.key});

  @override
  ConsumerState<AssignCoordinatorScreen> createState() =>
      _AssignCoordinatorScreenState();
}

class _AssignCoordinatorScreenState
    extends ConsumerState<AssignCoordinatorScreen> {
  final _searchCtrl = TextEditingController();
  Timer? _debounce;
  String _query = '';

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      setState(() => _query = value.trim());
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.arrow_back_rounded,
                          size: 20, color: theme.colorScheme.onSurface),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Assign Leader',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // ── Search bar ────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _searchCtrl,
                onChanged: _onSearchChanged,
                style: TextStyle(
                    fontSize: 14, color: theme.colorScheme.onSurface),
                decoration: InputDecoration(
                  hintText: 'Search by name, email, or phone…',
                  hintStyle: TextStyle(
                      color: theme.colorScheme.onSurface.withOpacity(0.3)),
                  prefixIcon: Icon(Icons.search_rounded,
                      size: 18,
                      color: theme.colorScheme.onSurface.withOpacity(0.3)),
                  filled: true,
                  fillColor: theme.colorScheme.onSurface.withOpacity(0.05),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // ── Results ───────────────────────────────
            Expanded(
              child: _query.length < 2
                  ? _buildHint(theme)
                  : _buildResults(theme),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHint(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.person_search_outlined,
                size: 48,
                color: theme.colorScheme.onSurface.withOpacity(0.12)),
            const SizedBox(height: 14),
            Text(
              'Search for a user to assign\na leadership position',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 13,
                  color: theme.colorScheme.onSurface.withOpacity(0.35)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResults(ThemeData theme) {
    final searchAsync = ref.watch(coordinatorSearchProvider(_query));
    return searchAsync.when(
      loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary)),
      error: (e, _) => Center(
          child: Text('Search failed',
              style: TextStyle(
                  color: theme.colorScheme.onSurface.withOpacity(0.5)))),
      data: (users) {
        if (users.isEmpty) {
          return Center(
            child: Text('No users found for "$_query"',
                style: TextStyle(
                    fontSize: 13,
                    color: theme.colorScheme.onSurface.withOpacity(0.4))),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 40),
          itemCount: users.length,
          itemBuilder: (_, i) => _UserCard(
            user: users[i],
            theme: theme,
            onTap: () => _showAssignSheet(users[i]),
          ),
        );
      },
    );
  }

  void _showAssignSheet(SearchedUser user) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _AssignSheet(
        user: user,
        onAssigned: () {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${user.name} has been assigned successfully'),
              backgroundColor: AppColors.success,
            ),
          );
          // Clear search to reset
          setState(() {
            _query = '';
            _searchCtrl.clear();
          });
        },
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// USER CARD
// ═══════════════════════════════════════════════════════════════

class _UserCard extends StatelessWidget {
  final SearchedUser user;
  final ThemeData theme;
  final VoidCallback onTap;
  const _UserCard(
      {required this.user, required this.theme, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final hasDes = user.designation != null &&
        user.designation != 'Community Member' &&
        user.designation!.isNotEmpty;

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border:
              Border.all(color: theme.colorScheme.outline.withOpacity(0.1)),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor:
                  theme.colorScheme.onSurface.withOpacity(0.06),
              backgroundImage: user.profileImage != null
                  ? NetworkImage(user.profileImage!)
                  : null,
              child: user.profileImage == null
                  ? Text(
                      user.name.isNotEmpty
                          ? user.name[0].toUpperCase()
                          : '?',
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface
                              .withOpacity(0.4)))
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(user.name,
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface)),
                  const SizedBox(height: 2),
                  Text(user.email ?? user.phone ?? '',
                      style: TextStyle(
                          fontSize: 12,
                          color: theme.colorScheme.onSurface
                              .withOpacity(0.4))),
                  if (hasDes) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        user.designation!,
                        style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded,
                size: 14,
                color: theme.colorScheme.onSurface.withOpacity(0.2)),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ASSIGNMENT BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════

class _AssignSheet extends ConsumerStatefulWidget {
  final SearchedUser user;
  final VoidCallback onAssigned;
  const _AssignSheet({required this.user, required this.onAssigned});

  @override
  ConsumerState<_AssignSheet> createState() => _AssignSheetState();
}

class _AssignSheetState extends ConsumerState<_AssignSheet> {
  String? _selectedDesignation;
  NigeriaLocation? _selectedState;
  NigeriaLocation? _selectedLGA;
  NigeriaLocation? _selectedWard;
  bool _loading = false;
  String? _error;

  // Designations this coordinator can assign
  List<String> get _assignableDesignations {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    if (userLevel == null) return [];
    if (userLevel.role == 'admin') {
      return [
        'State Coordinator',
        'LGA Coordinator',
        'Ward Coordinator',
        'Polling Unit Agent',
      ];
    }
    switch (userLevel.designation) {
      case 'National Coordinator':
        return [
          'State Coordinator',
          'LGA Coordinator',
          'Ward Coordinator',
          'Polling Unit Agent',
        ];
      case 'State Coordinator':
        return ['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'];
      case 'LGA Coordinator':
        return ['Ward Coordinator', 'Polling Unit Agent'];
      case 'Ward Coordinator':
        return ['Polling Unit Agent'];
      default:
        return [];
    }
  }

  bool get _needsState =>
      _selectedDesignation != null && _selectedDesignation != 'Community Member';
  bool get _needsLGA =>
      _selectedDesignation == 'LGA Coordinator' ||
      _selectedDesignation == 'Ward Coordinator' ||
      _selectedDesignation == 'Polling Unit Agent';
  bool get _needsWard =>
      _selectedDesignation == 'Ward Coordinator' ||
      _selectedDesignation == 'Polling Unit Agent';

  bool get _canSubmit {
    if (_selectedDesignation == null) return false;
    if (_selectedDesignation == 'State Coordinator' &&
        _selectedState == null) return false;
    if (_needsLGA && _selectedLGA == null) return false;
    if (_needsWard && _selectedWard == null) return false;
    return true;
  }

  Future<void> _submit() async {
    if (!_canSubmit || _loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final ds = ref.read(coordinatorDsProvider);
      await ds.assignDesignation(
        userId: widget.user.id,
        designation: _selectedDesignation!,
        assignedState: _selectedState?.name,
        assignedLGA: _selectedLGA?.name,
        assignedWard: _selectedWard?.name,
        override: widget.user.designation != null &&
            widget.user.designation != 'Community Member',
      );
      if (mounted) widget.onAssigned();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.fromLTRB(
          20, 12, 20, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.12),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // User info
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor:
                    theme.colorScheme.onSurface.withOpacity(0.06),
                backgroundImage: widget.user.profileImage != null
                    ? NetworkImage(widget.user.profileImage!)
                    : null,
                child: widget.user.profileImage == null
                    ? Text(
                        widget.user.name.isNotEmpty
                            ? widget.user.name[0].toUpperCase()
                            : '?',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface
                                .withOpacity(0.4)))
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.user.name,
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface)),
                    Text(widget.user.email ?? widget.user.phone ?? '',
                        style: TextStyle(
                            fontSize: 12,
                            color: theme.colorScheme.onSurface
                                .withOpacity(0.4))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Designation picker
          Text('Select Role',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface.withOpacity(0.5))),
          const SizedBox(height: 6),
          _Dropdown<String>(
            value: _selectedDesignation,
            hint: 'Choose designation…',
            items: _assignableDesignations,
            labelBuilder: (d) => d,
            theme: theme,
            onChanged: (d) {
              setState(() {
                _selectedDesignation = d;
                _selectedState = null;
                _selectedLGA = null;
                _selectedWard = null;
              });
            },
          ),
          const SizedBox(height: 12),

          // State picker
          if (_needsState) ...[
            Text('State',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color:
                        theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 6),
            _buildStatePicker(theme),
            const SizedBox(height: 12),
          ],

          // LGA picker
          if (_needsLGA && _selectedState != null) ...[
            Text('LGA',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color:
                        theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 6),
            _buildLGAPicker(theme),
            const SizedBox(height: 12),
          ],

          // Ward picker
          if (_needsWard && _selectedLGA != null) ...[
            Text('Ward',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color:
                        theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 6),
            _buildWardPicker(theme),
            const SizedBox(height: 12),
          ],

          // Error
          if (_error != null) ...[
            Text(_error!,
                style: const TextStyle(
                    fontSize: 12, color: AppColors.error)),
            const SizedBox(height: 8),
          ],

          const SizedBox(height: 8),

          // Submit
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _canSubmit && !_loading ? _submit : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                disabledBackgroundColor:
                    AppColors.primary.withOpacity(0.3),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: _loading
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Text('Assign',
                      style: TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatePicker(ThemeData theme) {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    // If State/LGA/Ward coordinator, their state is fixed
    if (userLevel != null &&
        userLevel.designation != 'National Coordinator' &&
        userLevel.role != 'admin') {
      final loc = userLevel.assignedLocation;
      final assignedStateName =
          (loc?['stateName'] as String?) ?? (loc?['stateId'] as String?) ?? '';

      // Resolve the real state id by matching name against nigeriaStatesProvider
      final statesAsync = ref.watch(nigeriaStatesProvider);
      statesAsync.whenData((states) {
        if (_selectedState == null || _selectedState!.id == 0) {
          final match = states.firstWhere(
            (s) =>
                s.name.toLowerCase() == assignedStateName.toLowerCase(),
            orElse: () => NigeriaLocation(id: 0, name: assignedStateName),
          );
          if (match.id != 0 &&
              (_selectedState == null || _selectedState!.id == 0)) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted &&
                  (_selectedState == null || _selectedState!.id == 0)) {
                setState(() => _selectedState = match);
              }
            });
          }
        }
      });

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          assignedStateName.isEmpty ? 'Your state' : assignedStateName,
          style: TextStyle(
              fontSize: 14, color: theme.colorScheme.onSurface),
        ),
      );
    }

    final statesAsync = ref.watch(nigeriaStatesProvider);
    return statesAsync.when(
      loading: () => _loadingBox(theme),
      error: (_, __) => const Text('Failed to load states',
          style:
              TextStyle(fontSize: 12, color: AppColors.error)),
      data: (states) => _Dropdown<NigeriaLocation>(
        value: _selectedState,
        hint: 'Select state…',
        items: states,
        labelBuilder: (s) => s.name,
        theme: theme,
        onChanged: (s) {
          setState(() {
            _selectedState = s;
            _selectedLGA = null;
            _selectedWard = null;
          });
        },
      ),
    );
  }

  Widget _buildLGAPicker(ThemeData theme) {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    // If LGA/Ward coordinator, their LGA is fixed
    if (userLevel != null &&
        (userLevel.designation == 'LGA Coordinator' ||
            userLevel.designation == 'Ward Coordinator')) {
      final loc = userLevel.assignedLocation;
      final assignedLgaName =
          (loc?['lgaName'] as String?) ?? (loc?['lgaId'] as String?) ?? '';

      // Resolve real LGA id once we have the state id
      if (_selectedState != null && _selectedState!.id != 0) {
        final lgasAsync = ref.watch(nigeriaLGAsProvider(_selectedState!.id));
        lgasAsync.whenData((lgas) {
          if (_selectedLGA == null || _selectedLGA!.id == 0) {
            final match = lgas.firstWhere(
              (l) =>
                  l.name.toLowerCase() == assignedLgaName.toLowerCase(),
              orElse: () => NigeriaLocation(id: 0, name: assignedLgaName),
            );
            if (match.id != 0) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted &&
                    (_selectedLGA == null || _selectedLGA!.id == 0)) {
                  setState(() => _selectedLGA = match);
                }
              });
            }
          }
        });
      }

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          assignedLgaName.isEmpty ? 'Your LGA' : assignedLgaName,
          style: TextStyle(
              fontSize: 14, color: theme.colorScheme.onSurface),
        ),
      );
    }

    if (_selectedState == null || _selectedState!.id == 0) {
      return _loadingBox(theme);
    }

    final lgasAsync = ref.watch(nigeriaLGAsProvider(_selectedState!.id));
    return lgasAsync.when(
      loading: () => _loadingBox(theme),
      error: (_, __) => const Text('Failed to load LGAs',
          style:
              TextStyle(fontSize: 12, color: AppColors.error)),
      data: (lgas) => _Dropdown<NigeriaLocation>(
        value: _selectedLGA,
        hint: 'Select LGA…',
        items: lgas,
        labelBuilder: (l) => l.name,
        theme: theme,
        onChanged: (l) {
          setState(() {
            _selectedLGA = l;
            _selectedWard = null;
          });
        },
      ),
    );
  }

  Widget _buildWardPicker(ThemeData theme) {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    if (userLevel != null && userLevel.designation == 'Ward Coordinator') {
      final loc = userLevel.assignedLocation;
      final assignedWardName =
          (loc?['wardName'] as String?) ?? (loc?['wardId'] as String?) ?? '';

      if (_selectedLGA != null && _selectedLGA!.id != 0) {
        final wardsAsync = ref.watch(nigeriaWardsProvider(_selectedLGA!.id));
        wardsAsync.whenData((wards) {
          if (_selectedWard == null || _selectedWard!.id == 0) {
            final match = wards.firstWhere(
              (w) =>
                  w.name.toLowerCase() == assignedWardName.toLowerCase(),
              orElse: () => NigeriaLocation(id: 0, name: assignedWardName),
            );
            if (match.id != 0) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted &&
                    (_selectedWard == null || _selectedWard!.id == 0)) {
                  setState(() => _selectedWard = match);
                }
              });
            }
          }
        });
      }

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          assignedWardName.isEmpty ? 'Your Ward' : assignedWardName,
          style: TextStyle(
              fontSize: 14, color: theme.colorScheme.onSurface),
        ),
      );
    }

    if (_selectedLGA == null || _selectedLGA!.id == 0) {
      return _loadingBox(theme);
    }

    final wardsAsync = ref.watch(nigeriaWardsProvider(_selectedLGA!.id));
    return wardsAsync.when(
      loading: () => _loadingBox(theme),
      error: (_, __) => const Text('Failed to load wards',
          style:
              TextStyle(fontSize: 12, color: AppColors.error)),
      data: (wards) => _Dropdown<NigeriaLocation>(
        value: _selectedWard,
        hint: 'Select ward…',
        items: wards,
        labelBuilder: (w) => w.name,
        theme: theme,
        onChanged: (w) => setState(() => _selectedWard = w),
      ),
    );
  }

  Widget _loadingBox(ThemeData theme) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.04),
        borderRadius: BorderRadius.circular(10),
      ),
      child: const Center(
          child: SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: AppColors.primary))),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERIC DROPDOWN
// ═══════════════════════════════════════════════════════════════

class _Dropdown<T> extends StatelessWidget {
  final T? value;
  final String hint;
  final List<T> items;
  final String Function(T) labelBuilder;
  final ThemeData theme;
  final ValueChanged<T?> onChanged;
  const _Dropdown({
    required this.value,
    required this.hint,
    required this.items,
    required this.labelBuilder,
    required this.theme,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.04),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.1)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          isExpanded: true,
          value: value,
          hint: Text(hint,
              style: TextStyle(
                  fontSize: 14,
                  color:
                      theme.colorScheme.onSurface.withOpacity(0.3))),
          dropdownColor: theme.colorScheme.surface,
          items: items
              .map((item) => DropdownMenuItem<T>(
                    value: item,
                    child: Text(labelBuilder(item),
                        style: TextStyle(
                            fontSize: 14,
                            color: theme.colorScheme.onSurface)),
                  ))
              .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
