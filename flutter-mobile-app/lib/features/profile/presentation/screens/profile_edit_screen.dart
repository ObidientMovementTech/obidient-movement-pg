import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../dashboard/presentation/providers/dashboard_providers.dart';
import '../../../state_dashboard/presentation/providers/dashboard_providers.dart'
    show nigeriaStatesProvider;
import '../widgets/username_field.dart';
import '../widgets/voting_location_picker.dart';

class ProfileEditScreen extends ConsumerStatefulWidget {
  const ProfileEditScreen({super.key});

  @override
  ConsumerState<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends ConsumerState<ProfileEditScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _usernameCtrl;

  UsernameStatus _usernameStatus = UsernameStatus.idle;

  String? _gender;
  String? _ageRange;
  String? _stateOfOrigin;

  VotingLocationSelection _votingLoc = const VotingLocationSelection();

  File? _pickedImage;
  String? _existingImageUrl;

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final u = ref.read(currentUserProvider);
    _nameCtrl = TextEditingController(text: u?.name ?? '');
    _usernameCtrl = TextEditingController(text: u?.userName ?? '');
    _gender = _normalize(u?.gender, const ['Male', 'Female', 'Other']);
    _ageRange = _normalizeAgeRange(u?.ageRange);
    _stateOfOrigin = u?.stateOfOrigin;
    _existingImageUrl = u?.profileImage;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _usernameCtrl.dispose();
    super.dispose();
  }

  String? _normalize(String? v, List<String> allowed) {
    if (v == null) return null;
    for (final a in allowed) {
      if (a.toLowerCase() == v.toLowerCase()) return a;
    }
    return null;
  }

  String? _normalizeAgeRange(String? v) {
    if (v == null) return null;
    const ranges = ['18-24', '25-34', '35-44', '45-54', '55+'];
    for (final r in ranges) {
      if (v.contains(r)) return r;
    }
    return null;
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

  Future<void> _save() async {
    FocusScope.of(context).unfocus();

    // Basic validation
    if (_nameCtrl.text.trim().split(' ').length < 2) {
      _snack('Enter your full name (surname + first name)');
      return;
    }
    if (_usernameStatus == UsernameStatus.taken ||
        _usernameStatus == UsernameStatus.invalid ||
        _usernameStatus == UsernameStatus.checking) {
      _snack('Please choose a valid, available username');
      return;
    }

    HapticFeedback.mediumImpact();
    setState(() => _saving = true);

    try {
      final ds = ref.read(userDataSourceProvider);

      // Upload image first if changed
      if (_pickedImage != null) {
        await ds.uploadProfileImage(_pickedImage!.path);
      }

      final updates = <String, dynamic>{
        'name': _nameCtrl.text.trim(),
      };
      final usernameTrimmed = _usernameCtrl.text.trim();
      final originalUsername =
          ref.read(currentUserProvider)?.userName ?? '';
      if (usernameTrimmed.isNotEmpty &&
          usernameTrimmed != originalUsername) {
        updates['userName'] = usernameTrimmed;
      }
      if (_gender != null) updates['gender'] = _gender;
      if (_ageRange != null) updates['ageRange'] = _ageRange;
      if (_stateOfOrigin != null) updates['stateOfOrigin'] = _stateOfOrigin;
      if (_votingLoc.isComplete) {
        updates['votingState'] = _votingLoc.state!.name;
        updates['votingLGA'] = _votingLoc.lga!.name;
        updates['votingWard'] = _votingLoc.ward!.name;
        updates['votingPU'] = _votingLoc.pu!.name;
      }

      final updated = await ds.updateProfile(updates);
      if (!mounted) return;

      ref.read(authStateProvider.notifier).state =
          AuthState.authenticated(updated);
      ref.invalidate(profileCompletionProvider);

      HapticFeedback.lightImpact();
      _snack('Profile updated', success: true);
      if (mounted) context.pop();
    } catch (e) {
      _snack(e.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _snack(String msg, {bool success = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor:
            success ? const Color(0xFF34C759) : const Color(0xFFFF3B30),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final appC = context.appColors;
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Edit Profile',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: Text(
              _saving ? 'Saving…' : 'Save',
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
          children: [
            // Avatar
            Center(
              child: GestureDetector(
                onTap: _pickImage,
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: appC.elevated,
                      backgroundImage: _pickedImage != null
                          ? FileImage(_pickedImage!)
                          : (_existingImageUrl != null &&
                                  _existingImageUrl!.isNotEmpty
                              ? CachedNetworkImageProvider(
                                  _existingImageUrl!)
                              : null) as ImageProvider?,
                      child: (_pickedImage == null &&
                              (_existingImageUrl == null ||
                                  _existingImageUrl!.isEmpty))
                          ? Icon(Icons.person_rounded,
                              size: 40, color: appC.textMuted)
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
                              color: theme.scaffoldBackgroundColor,
                              width: 2),
                        ),
                        child: const Icon(
                          Icons.camera_alt_rounded,
                          size: 14,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 4),
            Center(
              child: Text(
                'Tap to change photo',
                style: TextStyle(fontSize: 12, color: appC.textMuted),
              ),
            ),
            const SizedBox(height: 24),

            // Basic info section
            _sectionLabel('Basic Info', appC),
            const SizedBox(height: 12),

            _labeledField(
              label: 'Full name',
              controller: _nameCtrl,
              hint: 'Surname first',
            ),
            const SizedBox(height: 16),

            UsernameField(
              controller: _usernameCtrl,
              initialUsername: user?.userName,
              onStatusChanged: (s) => setState(() => _usernameStatus = s),
            ),
            const SizedBox(height: 16),

            // Email (read-only + change button)
            _emailRow(theme, appC, user?.email),
            const SizedBox(height: 16),

            // Phone (read-only)
            _phoneRow(theme, appC, user?.phone),
            const SizedBox(height: 24),

            // Personal
            _sectionLabel('Personal', appC),
            const SizedBox(height: 12),
            _dropdown(
              label: 'Gender',
              value: _gender,
              items: const ['Male', 'Female', 'Other'],
              onChanged: (v) => setState(() => _gender = v),
              appC: appC,
            ),
            const SizedBox(height: 16),
            _dropdown(
              label: 'Age Range',
              value: _ageRange,
              items: const ['18-24', '25-34', '35-44', '45-54', '55+'],
              onChanged: (v) => setState(() => _ageRange = v),
              appC: appC,
            ),
            const SizedBox(height: 16),
            _stateOfOriginDropdown(appC),
            const SizedBox(height: 24),

            // Voting location
            _sectionLabel('Voting Location', appC),
            const SizedBox(height: 4),
            Text(
              'Where you\'re registered to vote.',
              style: TextStyle(fontSize: 12, color: appC.textMuted),
            ),
            const SizedBox(height: 16),
            VotingLocationPicker(
              initialStateName: user?.votingState,
              initialLgaName: user?.votingLGA,
              initialWardName: user?.votingWard,
              initialPuName: user?.votingPU,
              onChanged: (sel) => _votingLoc = sel,
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String text, AppColorExtension appC) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.3,
        color: appC.textMuted,
      ),
    );
  }

  Widget _labeledField({
    required String label,
    required TextEditingController controller,
    String? hint,
    TextInputType? keyboardType,
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
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: _inputDecoration(appC, hint: hint),
        ),
      ],
    );
  }

  Widget _emailRow(
      ThemeData theme, AppColorExtension appC, String? email) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: appC.elevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: appC.borderSubtle),
      ),
      child: Row(
        children: [
          Icon(Icons.email_outlined, size: 18, color: appC.textMuted),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Email',
                    style: TextStyle(fontSize: 11, color: appC.textMuted)),
                const SizedBox(height: 2),
                Text(
                  email ?? '—',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.push('/profile/email-change'),
            child: const Text(
              'Change',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _phoneRow(
      ThemeData theme, AppColorExtension appC, String? phone) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: appC.elevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: appC.borderSubtle),
      ),
      child: Row(
        children: [
          Icon(Icons.phone_iphone_rounded, size: 18, color: appC.textMuted),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Phone',
                    style: TextStyle(fontSize: 11, color: appC.textMuted)),
                const SizedBox(height: 2),
                Text(
                  phone ?? '—',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _dropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    required AppColorExtension appC,
  }) {
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
          decoration: _inputDecoration(appC),
          items: items
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _stateOfOriginDropdown(AppColorExtension appC) {
    final statesAsync = ref.watch(nigeriaStatesProvider);
    return statesAsync.when(
      loading: () => _labeledField(
          label: 'State of Origin',
          controller: TextEditingController(text: 'Loading…')),
      error: (_, __) => _labeledField(
        label: 'State of Origin',
        controller: TextEditingController(text: 'Failed to load'),
      ),
      data: (states) {
        final current = states.any(
                (l) => l.name.toLowerCase() == (_stateOfOrigin ?? '').toLowerCase())
            ? states
                .firstWhere((l) =>
                    l.name.toLowerCase() ==
                    (_stateOfOrigin ?? '').toLowerCase())
                .name
            : null;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('State of Origin',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: appC.textSecondary,
                )),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: current,
              isExpanded: true,
              decoration: _inputDecoration(appC),
              items: states
                  .map((l) => DropdownMenuItem(
                        value: l.name,
                        child: Text(l.name, overflow: TextOverflow.ellipsis),
                      ))
                  .toList(),
              onChanged: (v) => setState(() => _stateOfOrigin = v),
            ),
          ],
        );
      },
    );
  }

  InputDecoration _inputDecoration(AppColorExtension appC, {String? hint}) {
    return InputDecoration(
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
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
    );
  }
}
