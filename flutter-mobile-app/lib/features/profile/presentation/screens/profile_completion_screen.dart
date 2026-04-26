import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../dashboard/data/datasources/user_remote_datasource.dart';
import '../../../dashboard/presentation/providers/dashboard_providers.dart';
import '../../../state_dashboard/data/models/coordinator_models.dart';
import '../../../state_dashboard/presentation/providers/dashboard_providers.dart'
    show
        nigeriaStatesProvider,
        nigeriaLGAsProvider,
        nigeriaWardsProvider,
        nigeriaPollingUnitsProvider;

/// Blocking profile-completion screen shown after login when
/// profileCompletionPercentage < 100.
/// The user cannot navigate away except to log out.
class ProfileCompletionScreen extends ConsumerStatefulWidget {
  const ProfileCompletionScreen({super.key});

  @override
  ConsumerState<ProfileCompletionScreen> createState() =>
      _ProfileCompletionScreenState();
}

class _ProfileCompletionScreenState
    extends ConsumerState<ProfileCompletionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _scrollCtrl = ScrollController();

  late final TextEditingController _nameCtrl;
  late final TextEditingController _phoneCtrl;

  String? _gender;
  String? _ageRange;
  String? _stateOfOrigin;
  String? _isVoter;
  String? _willVote;

  // Cascading location selections
  NigeriaLocation? _votingState;
  NigeriaLocation? _votingLGA;
  NigeriaLocation? _votingWard;
  NigeriaLocation? _votingPU;

  // Prefill tracking — prevents re-running once user starts editing
  bool _prefilledState = false;
  bool _prefilledLGA = false;
  bool _prefilledWard = false;
  bool _prefilledPU = false;

  File? _pickedImage;
  String? _existingImageUrl;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _nameCtrl = TextEditingController(text: user?.name ?? '');
    _phoneCtrl = TextEditingController(text: user?.phone ?? '');
    _gender = _normalize(user?.gender, const ['Male', 'Female', 'Other']);
    _ageRange = _normalizeAgeRange(user?.ageRange);
    _stateOfOrigin = user?.stateOfOrigin;
    _isVoter = _normalize(user?.isVoter, const ['Yes', 'No']);
    _willVote = _normalize(user?.willVote, const ['Yes', 'No']);
    _existingImageUrl = user?.profileImage;
  }

  /// Returns value only if it's in the allowed list (case-insensitive match).
  String? _normalize(String? value, List<String> allowed) {
    if (value == null) return null;
    for (final a in allowed) {
      if (a.toLowerCase() == value.toLowerCase()) return a;
    }
    return null;
  }

  /// Extract "25-34" from legacy formats like "25-34 (Adult)".
  String? _normalizeAgeRange(String? value) {
    if (value == null) return null;
    const ranges = ['18-24', '25-34', '35-44', '45-54', '55+'];
    for (final r in ranges) {
      if (value.contains(r)) return r;
    }
    return null;
  }

  /// Case-insensitive name lookup in a location list.
  NigeriaLocation? _findByName(List<NigeriaLocation> list, String? name) {
    if (name == null || name.trim().isEmpty) return null;
    final target = name.trim().toLowerCase();
    for (final loc in list) {
      if (loc.name.toLowerCase() == target) return loc;
    }
    return null;
  }

  void _prefillVotingState(List<NigeriaLocation> states) {
    if (_prefilledState) return;
    _prefilledState = true;
    final userState = ref.read(currentUserProvider)?.votingState;
    final match = _findByName(states, userState);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _votingState = match);
      });
    }
  }

  void _prefillLGA(List<NigeriaLocation> lgas) {
    if (_prefilledLGA) return;
    _prefilledLGA = true;
    final userLGA = ref.read(currentUserProvider)?.votingLGA;
    final match = _findByName(lgas, userLGA);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _votingLGA = match);
      });
    }
  }

  void _prefillWard(List<NigeriaLocation> wards) {
    if (_prefilledWard) return;
    _prefilledWard = true;
    final userWard = ref.read(currentUserProvider)?.votingWard;
    final match = _findByName(wards, userWard);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _votingWard = match);
      });
    }
  }

  void _prefillPU(List<NigeriaLocation> pus) {
    if (_prefilledPU) return;
    _prefilledPU = true;
    final userPU = ref.read(currentUserProvider)?.votingPU;
    final match = _findByName(pus, userPU);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _votingPU = match);
      });
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_rounded),
              title: const Text('Camera'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_rounded),
              title: const Text('Gallery'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    final picked = await ImagePicker().pickImage(
      source: source,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 85,
    );
    if (picked != null) {
      setState(() => _pickedImage = File(picked.path));
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    // Validate profile image
    if (_pickedImage == null &&
        (_existingImageUrl == null || _existingImageUrl!.isEmpty)) {
      _showError('Please add a profile photo.');
      return;
    }

    // Validate required selections
    if (_votingState == null ||
        _votingLGA == null ||
        _votingWard == null ||
        _votingPU == null) {
      _showError('Please select your full voting location (State → LGA → Ward → Polling Unit).');
      return;
    }
    if (_gender == null) {
      _showError('Please select your gender.');
      return;
    }
    if (_ageRange == null) {
      _showError('Please select your age range.');
      return;
    }
    if (_isVoter == null || _willVote == null) {
      _showError('Please answer the voter questions.');
      return;
    }

    HapticFeedback.mediumImpact();
    setState(() => _isSaving = true);

    try {
      final ds = ref.read(userDataSourceProvider);

      // Upload image first if picked
      if (_pickedImage != null) {
        await ds.uploadProfileImage(_pickedImage!.path);
      }

      // Save profile
      final updatedUser = await ds.updateProfile({
        'name': _nameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        // TODO: add OTP verification when SMS service available
        'gender': _gender,
        'ageRange': _ageRange,
        'stateOfOrigin': _stateOfOrigin,
        'votingState': _votingState!.name,
        'votingLGA': _votingLGA!.name,
        'votingWard': _votingWard!.name,
        'votingPU': _votingPU!.name,
        'isVoter': _isVoter,
        'willVote': _willVote,
      });

      if (!mounted) return;

      // Refresh auth state with the updated user
      ref.read(authStateProvider.notifier).state =
          AuthState.authenticated(updatedUser);

      // Invalidate profile completion cache
      ref.invalidate(profileCompletionProvider);

      HapticFeedback.lightImpact();
      // Router guard will auto-redirect to /home now
    } catch (e) {
      if (mounted) _showError(e.toString());
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
      ),
    );
  }

  Future<void> _logout() async {
    HapticFeedback.mediumImpact();
    await SecureStorage.clearAll();
    if (!mounted) return;
    ref.read(authStateProvider.notifier).state =
        const AuthState.unauthenticated();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;
    final statesAsync = ref.watch(nigeriaStatesProvider);
    final user = ref.watch(currentUserProvider);
    final missing = user?.missingProfileFields ?? const <String>[];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Complete Your Profile',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: cs.onSurface,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          missing.isEmpty
                              ? 'All set — tap save to continue.'
                              : missing.length == 1
                                  ? 'Just one more: ${missing.first}.'
                                  : '${missing.length} fields remaining.',
                          style: TextStyle(
                            fontSize: 13,
                            color: appC.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: _logout,
                    child: Text(
                      'Log out',
                      style: TextStyle(
                        color: AppColors.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Missing fields banner ───────────────────────
            if (missing.isNotEmpty && missing.length <= 5)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.warning.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.info_outline_rounded,
                        size: 18,
                        color: AppColors.warning,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Still needed',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.warning,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              missing.join(' • '),
                              style: TextStyle(
                                fontSize: 12,
                                color: cs.onSurface.withOpacity(0.85),
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 12),

            // ── Form ────────────────────────────────────────
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  controller: _scrollCtrl,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  children: [
                    // ── Profile Image ───────────────────────
                    Center(
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Stack(
                          children: [
                            CircleAvatar(
                              radius: 50,
                              backgroundColor: cs.surfaceContainerHighest,
                              backgroundImage: _pickedImage != null
                                  ? FileImage(_pickedImage!)
                                  : (_existingImageUrl != null &&
                                          _existingImageUrl!.isNotEmpty
                                      ? NetworkImage(_existingImageUrl!)
                                          as ImageProvider
                                      : null),
                              child: (_pickedImage == null &&
                                      (_existingImageUrl == null ||
                                          _existingImageUrl!.isEmpty))
                                  ? Icon(
                                      Icons.person_rounded,
                                      size: 40,
                                      color: appC.textMuted,
                                    )
                                  : null,
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: cs.surface,
                                    width: 2,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.camera_alt_rounded,
                                  size: 16,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        'Tap to add photo',
                        style: TextStyle(
                          fontSize: 12,
                          color: appC.textMuted,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ── Legal Name ──────────────────────────
                    _buildField(
                      'Legal Name',
                      _nameCtrl,
                      hint: 'Surname first, as on your ID',
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'Name is required';
                        }
                        if (v.trim().split(' ').length < 2) {
                          return 'Enter surname and first name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // ── Phone ───────────────────────────────
                    _buildField(
                      'Phone Number',
                      _phoneCtrl,
                      hint: '08012345678',
                      keyboardType: TextInputType.phone,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'Phone number is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // ── Gender ──────────────────────────────
                    _buildDropdown(
                      label: 'Gender',
                      value: _gender,
                      items: const ['Male', 'Female', 'Other'],
                      onChanged: (v) => setState(() => _gender = v),
                    ),
                    const SizedBox(height: 16),

                    // ── Age Range ───────────────────────────
                    _buildDropdown(
                      label: 'Age Range',
                      value: _ageRange,
                      items: const [
                        '18-24',
                        '25-34',
                        '35-44',
                        '45-54',
                        '55+'
                      ],
                      onChanged: (v) => setState(() => _ageRange = v),
                    ),
                    const SizedBox(height: 16),

                    // ── State of Origin ─────────────────────
                    statesAsync.when(
                      loading: () =>
                          _buildLoadingDropdown('State of Origin'),
                      error: (_, __) =>
                          _buildErrorDropdown('State of Origin'),
                      data: (states) => _buildLocationDropdown(
                        label: 'State of Origin',
                        value: _stateOfOrigin,
                        items: states,
                        onChanged: (loc) {
                          setState(() {
                            _stateOfOrigin = loc?.name;
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ── Section: Voting Location ────────────
                    Text(
                      'Voting Location',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: cs.onSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Where you\'re registered to vote.',
                      style: TextStyle(
                        fontSize: 12,
                        color: appC.textMuted,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ── Voting State ────────────────────────
                    statesAsync.when(
                      loading: () =>
                          _buildLoadingDropdown('Voting State'),
                      error: (_, __) =>
                          _buildErrorDropdown('Voting State'),
                      data: (states) {
                        _prefillVotingState(states);
                        return _buildLocationDropdown(
                          label: 'Voting State',
                          value: _votingState?.name,
                          items: states,
                          onChanged: (loc) {
                            setState(() {
                              _votingState = loc;
                              _votingLGA = null;
                              _votingWard = null;
                              _votingPU = null;
                              _prefilledLGA = true;
                              _prefilledWard = true;
                              _prefilledPU = true;
                            });
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 16),

                    // ── Voting LGA ──────────────────────────
                    if (_votingState != null)
                      ref
                          .watch(nigeriaLGAsProvider(_votingState!.id))
                          .when(
                            loading: () =>
                                _buildLoadingDropdown('LGA'),
                            error: (_, __) =>
                                _buildErrorDropdown('LGA'),
                            data: (lgas) {
                              _prefillLGA(lgas);
                              return _buildLocationDropdown(
                                label: 'LGA',
                                value: _votingLGA?.name,
                                items: lgas,
                                onChanged: (loc) {
                                  setState(() {
                                    _votingLGA = loc;
                                    _votingWard = null;
                                    _votingPU = null;
                                    _prefilledWard = true;
                                    _prefilledPU = true;
                                  });
                                },
                              );
                            },
                          )
                    else
                      _buildDisabledDropdown(
                          'LGA', 'Select a state first'),
                    const SizedBox(height: 16),

                    // ── Voting Ward ─────────────────────────
                    if (_votingLGA != null)
                      ref
                          .watch(nigeriaWardsProvider(_votingLGA!.id))
                          .when(
                            loading: () =>
                                _buildLoadingDropdown('Ward'),
                            error: (_, __) =>
                                _buildErrorDropdown('Ward'),
                            data: (wards) {
                              _prefillWard(wards);
                              return _buildLocationDropdown(
                                label: 'Ward',
                                value: _votingWard?.name,
                                items: wards,
                                onChanged: (loc) {
                                  setState(() {
                                    _votingWard = loc;
                                    _votingPU = null;
                                    _prefilledPU = true;
                                  });
                                },
                              );
                            },
                          )
                    else
                      _buildDisabledDropdown(
                          'Ward', 'Select an LGA first'),
                    const SizedBox(height: 16),

                    // ── Voting Polling Unit ─────────────────
                    if (_votingWard != null)
                      ref
                          .watch(nigeriaPollingUnitsProvider(
                              _votingWard!.id))
                          .when(
                            loading: () => _buildLoadingDropdown(
                                'Polling Unit'),
                            error: (_, __) => _buildErrorDropdown(
                                'Polling Unit'),
                            data: (pus) {
                              _prefillPU(pus);
                              return _buildLocationDropdown(
                                label: 'Polling Unit',
                                value: _votingPU?.name,
                                items: pus,
                                onChanged: (loc) {
                                  setState(() => _votingPU = loc);
                                },
                              );
                            },
                          )
                    else
                      _buildDisabledDropdown(
                          'Polling Unit', 'Select a ward first'),
                    const SizedBox(height: 24),

                    // ── Voter questions ─────────────────────
                    _buildDropdown(
                      label: 'Are you a registered voter?',
                      value: _isVoter,
                      items: const ['Yes', 'No'],
                      onChanged: (v) => setState(() => _isVoter = v),
                    ),
                    const SizedBox(height: 16),

                    _buildDropdown(
                      label: 'Will you vote?',
                      value: _willVote,
                      items: const ['Yes', 'No'],
                      onChanged: (v) => setState(() => _willVote = v),
                    ),
                    const SizedBox(height: 32),

                    // ── Submit ───────────────────────────────
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Save & Continue',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Helpers ───────────────────────────────────────────────────

  Widget _buildField(
    String label,
    TextEditingController ctrl, {
    String? hint,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: ctrl,
          keyboardType: keyboardType,
          validator: validator,
          style: TextStyle(fontSize: 14, color: cs.onSurface),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: appC.textMuted, fontSize: 13),
            filled: true,
            fillColor: appC.elevated,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: appC.borderSubtle),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: appC.borderSubtle),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide:
                  const BorderSide(color: AppColors.primary, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    final appC = context.appColors;
    // Only use value if it's in items — server may store legacy/extended labels
    final safeValue = items.contains(value) ? value : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: safeValue,
          isExpanded: true,
          decoration: InputDecoration(
            filled: true,
            fillColor: appC.elevated,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: appC.borderSubtle),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: appC.borderSubtle),
            ),
          ),
          items: items
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildLocationDropdown({
    required String label,
    required String? value,
    required List<NigeriaLocation> items,
    required ValueChanged<NigeriaLocation?> onChanged,
  }) {
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: items.any((l) => l.name == value) ? value : null,
          isExpanded: true,
          decoration: InputDecoration(
            filled: true,
            fillColor: appC.elevated,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: appC.borderSubtle),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: appC.borderSubtle),
            ),
          ),
          items: items
              .map(
                (loc) => DropdownMenuItem(
                  value: loc.name,
                  child: Text(
                    loc.name,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              )
              .toList(),
          onChanged: (name) {
            final loc = items.firstWhere((l) => l.name == name);
            onChanged(loc);
          },
        ),
      ],
    );
  }

  Widget _buildLoadingDropdown(String label) {
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: appC.elevated,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: appC.borderSubtle),
          ),
          alignment: Alignment.centerLeft,
          child: Row(
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: appC.textMuted,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Loading...',
                style: TextStyle(
                  fontSize: 13,
                  color: appC.textMuted,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildErrorDropdown(String label) {
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: appC.elevated,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.error.withOpacity(0.3)),
          ),
          alignment: Alignment.centerLeft,
          child: Text(
            'Failed to load. Pull to retry.',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.error.withOpacity(0.8),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDisabledDropdown(String label, String hint) {
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: appC.elevated.withOpacity(0.5),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: appC.borderSubtle),
          ),
          alignment: Alignment.centerLeft,
          child: Text(
            hint,
            style: TextStyle(
              fontSize: 13,
              color: appC.textDisabled,
            ),
          ),
        ),
      ],
    );
  }
}
