import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../state_dashboard/data/models/coordinator_models.dart';
import '../../../state_dashboard/presentation/providers/dashboard_providers.dart';
import '../../data/models/kyc_personal_info.dart';
import '../providers/kyc_providers.dart';

class KycStepPersonalInfo extends ConsumerStatefulWidget {
  const KycStepPersonalInfo({super.key});

  @override
  ConsumerState<KycStepPersonalInfo> createState() =>
      _KycStepPersonalInfoState();
}

class _KycStepPersonalInfoState extends ConsumerState<KycStepPersonalInfo> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstNameCtrl;
  late final TextEditingController _lastNameCtrl;
  late final TextEditingController _userNameCtrl;
  late final TextEditingController _phoneCtrl;

  String? _gender;
  String? _ageRange;
  String? _citizenship;
  String? _isVoter;
  String? _willVote;

  // Location — store both name (for display/save) and id (for API cascade)
  NigeriaLocation? _selectedState;
  NigeriaLocation? _selectedLGA;
  NigeriaLocation? _selectedWard;
  String? _stateOfOrigin;
  String? _votingEngagementState;

  @override
  void initState() {
    super.initState();
    final info = ref.read(kycFormProvider).personalInfo;
    _firstNameCtrl = TextEditingController(text: info.firstName ?? '');
    _lastNameCtrl = TextEditingController(text: info.lastName ?? '');
    _userNameCtrl = TextEditingController(text: info.userName ?? '');
    _phoneCtrl = TextEditingController(text: info.phoneNumber ?? '');
    _gender = info.gender;
    _ageRange = info.ageRange;
    _citizenship = info.citizenship;
    _isVoter = info.isVoter;
    _willVote = info.willVote;
    _stateOfOrigin = info.stateOfOrigin;
    _votingEngagementState = info.votingEngagementState;
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _userNameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  KycPersonalInfo _buildInfo() => KycPersonalInfo(
        firstName: _firstNameCtrl.text.trim(),
        lastName: _lastNameCtrl.text.trim(),
        userName: _userNameCtrl.text.trim(),
        phoneNumber: _phoneCtrl.text.trim(),
        gender: _gender,
        lga: _selectedLGA?.name ?? ref.read(kycFormProvider).personalInfo.lga,
        ward:
            _selectedWard?.name ?? ref.read(kycFormProvider).personalInfo.ward,
        ageRange: _ageRange,
        stateOfOrigin: _stateOfOrigin,
        votingEngagementState: _votingEngagementState,
        citizenship: _citizenship,
        isVoter: _isVoter,
        willVote: _willVote,
      );

  Future<void> _onContinue() async {
    if (!_formKey.currentState!.validate()) return;
    HapticFeedback.mediumImpact();
    ref.read(kycFormProvider.notifier).updatePersonalInfo(_buildInfo());
    final ok = await ref.read(kycFormProvider.notifier).savePersonalInfo();
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ref.read(kycFormProvider).error ?? 'Save failed'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(kycFormProvider);
    final statesAsync = ref.watch(nigeriaStatesProvider);
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          Text(
            'Personal Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: cs.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'We need this to verify your identity.',
            style: TextStyle(fontSize: 13, color: appC.textMuted),
          ),
          const SizedBox(height: 24),

          // ── Name row ─────────────────────────────────────────
          Row(
            children: [
              Expanded(child: _buildField('First Name', _firstNameCtrl)),
              const SizedBox(width: 12),
              Expanded(child: _buildField('Last Name', _lastNameCtrl)),
            ],
          ),
          const SizedBox(height: 16),

          _buildField('Username', _userNameCtrl),
          const SizedBox(height: 16),

          _buildField('Phone Number', _phoneCtrl,
              keyboardType: TextInputType.phone),
          const SizedBox(height: 16),

          // ── Gender ───────────────────────────────────────────
          _buildDropdown(
            label: 'Gender',
            value: _gender,
            items: const ['Male', 'Female', 'Other'],
            onChanged: (v) => setState(() => _gender = v),
          ),
          const SizedBox(height: 16),

          // ── Age range ────────────────────────────────────────
          _buildDropdown(
            label: 'Age Range',
            value: _ageRange,
            items: const ['18-24', '25-34', '35-44', '45-54', '55+'],
            onChanged: (v) => setState(() => _ageRange = v),
          ),
          const SizedBox(height: 16),

          // ── State of Origin (from states endpoint) ───────────
          statesAsync.when(
            loading: () => _buildLoadingDropdown('State of Origin'),
            error: (_, __) => _buildErrorDropdown('State of Origin'),
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
          const SizedBox(height: 16),

          // ── Voting Engagement State ──────────────────────────
          statesAsync.when(
            loading: () => _buildLoadingDropdown('Voting Engagement State'),
            error: (_, __) => _buildErrorDropdown('Voting Engagement State'),
            data: (states) => _buildLocationDropdown(
              label: 'Voting Engagement State',
              value: _votingEngagementState,
              items: states,
              onChanged: (loc) {
                setState(() {
                  _votingEngagementState = loc?.name;
                  _selectedState = loc;
                  _selectedLGA = null;
                  _selectedWard = null;
                });
              },
            ),
          ),
          const SizedBox(height: 16),

          // ── LGA (cascaded from selected state) ───────────────
          if (_selectedState != null)
            ref.watch(nigeriaLGAsProvider(_selectedState!.id)).when(
                  loading: () => _buildLoadingDropdown('LGA'),
                  error: (_, __) => _buildErrorDropdown('LGA'),
                  data: (lgas) => _buildLocationDropdown(
                    label: 'LGA',
                    value: _selectedLGA?.name,
                    items: lgas,
                    onChanged: (loc) {
                      setState(() {
                        _selectedLGA = loc;
                        _selectedWard = null;
                      });
                    },
                  ),
                )
          else
            _buildDisabledDropdown('LGA', 'Select a state first'),
          const SizedBox(height: 16),

          // ── Ward (cascaded from LGA) ─────────────────────────
          if (_selectedLGA != null)
            ref.watch(nigeriaWardsProvider(_selectedLGA!.id)).when(
                  loading: () => _buildLoadingDropdown('Ward'),
                  error: (_, __) => _buildErrorDropdown('Ward'),
                  data: (wards) => _buildLocationDropdown(
                    label: 'Ward',
                    value: _selectedWard?.name,
                    items: wards,
                    onChanged: (loc) {
                      setState(() => _selectedWard = loc);
                    },
                  ),
                )
          else
            _buildDisabledDropdown('Ward', 'Select an LGA first'),
          const SizedBox(height: 16),

          // ── Citizenship ──────────────────────────────────────
          _buildDropdown(
            label: 'Citizenship',
            value: _citizenship,
            items: const ['Nigerian Citizen', 'Diaspora'],
            onChanged: (v) => setState(() => _citizenship = v),
          ),
          const SizedBox(height: 16),

          // ── Is Voter ─────────────────────────────────────────
          _buildDropdown(
            label: 'Are you a registered voter?',
            value: _isVoter,
            items: const ['Yes', 'No'],
            onChanged: (v) => setState(() => _isVoter = v),
          ),
          const SizedBox(height: 16),

          // ── Will Vote ────────────────────────────────────────
          _buildDropdown(
            label: 'Will you vote?',
            value: _willVote,
            items: const ['Yes', 'No'],
            onChanged: (v) => setState(() => _willVote = v),
          ),
          const SizedBox(height: 32),

          // ── Continue ─────────────────────────────────────────
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: formState.isSaving ? null : _onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: formState.isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Continue',
                      style:
                          TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                    ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ── Helper widgets ─────────────────────────────────────────────

  Widget _buildField(
    String label,
    TextEditingController ctrl, {
    TextInputType? keyboardType,
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
          style: TextStyle(fontSize: 14, color: cs.onSurface),
          decoration: InputDecoration(
            filled: true,
            fillColor: appC.elevated,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: cs.outline),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: cs.outline),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide:
                  BorderSide(color: cs.primary, width: 1.5),
            ),
          ),
          validator: (v) =>
              (v == null || v.trim().isEmpty) ? '$label is required' : null,
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
        DropdownButtonFormField<String>(
          value: value,
          isExpanded: true,
          dropdownColor: appC.elevated,
          style: TextStyle(fontSize: 14, color: cs.onSurface),
          decoration: InputDecoration(
            filled: true,
            fillColor: appC.elevated,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: cs.outline),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: cs.outline),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide:
                  BorderSide(color: cs.primary, width: 1.5),
            ),
          ),
          items: items
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: onChanged,
          validator: (v) => v == null ? '$label is required' : null,
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
        DropdownButtonFormField<String>(
          value: items.any((i) => i.name == value) ? value : null,
          isExpanded: true,
          dropdownColor: appC.elevated,
          style: TextStyle(fontSize: 14, color: cs.onSurface),
          decoration: InputDecoration(
            filled: true,
            fillColor: appC.elevated,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: cs.outline),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: cs.outline),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide:
                  BorderSide(color: cs.primary, width: 1.5),
            ),
          ),
          items: items
              .map((loc) =>
                  DropdownMenuItem(value: loc.name, child: Text(loc.name)))
              .toList(),
          onChanged: (name) {
            final loc = items.firstWhere((i) => i.name == name);
            onChanged(loc);
          },
          validator: (v) => v == null ? '$label is required' : null,
        ),
      ],
    );
  }

  Widget _buildLoadingDropdown(String label) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: appC.textSecondary)),
        const SizedBox(height: 6),
        Container(
          height: 52,
          decoration: BoxDecoration(
            color: appC.elevated,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: cs.outline),
          ),
          child: const Center(
            child: SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorDropdown(String label) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: appC.textSecondary)),
        const SizedBox(height: 6),
        Container(
          height: 52,
          decoration: BoxDecoration(
            color: appC.elevated,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: cs.error.withOpacity(0.3)),
          ),
          child: Center(
            child:
                Text('Failed to load', style: TextStyle(color: cs.error, fontSize: 13)),
          ),
        ),
      ],
    );
  }

  Widget _buildDisabledDropdown(String label, String hint) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: appC.textSecondary)),
        const SizedBox(height: 6),
        Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: appC.elevated.withOpacity(0.5),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: cs.outline),
          ),
          alignment: Alignment.centerLeft,
          child: Text(hint,
              style:
                  TextStyle(color: appC.textDisabled, fontSize: 14)),
        ),
      ],
    );
  }
}
