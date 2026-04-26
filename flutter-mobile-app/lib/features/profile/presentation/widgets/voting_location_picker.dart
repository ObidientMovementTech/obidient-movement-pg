import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../state_dashboard/data/models/coordinator_models.dart';
import '../../../state_dashboard/presentation/providers/dashboard_providers.dart'
    show
        nigeriaStatesProvider,
        nigeriaLGAsProvider,
        nigeriaWardsProvider,
        nigeriaPollingUnitsProvider;

/// Selection payload.
class VotingLocationSelection {
  final NigeriaLocation? state;
  final NigeriaLocation? lga;
  final NigeriaLocation? ward;
  final NigeriaLocation? pu;

  const VotingLocationSelection({this.state, this.lga, this.ward, this.pu});

  bool get isComplete =>
      state != null && lga != null && ward != null && pu != null;
}

/// Cascading State → LGA → Ward → PU picker. Pre-fills from initial names
/// (case-insensitive) and emits changes via [onChanged].
class VotingLocationPicker extends ConsumerStatefulWidget {
  /// Prefill names (matching done case-insensitively by `.name`).
  final String? initialStateName;
  final String? initialLgaName;
  final String? initialWardName;
  final String? initialPuName;

  final ValueChanged<VotingLocationSelection> onChanged;

  const VotingLocationPicker({
    super.key,
    this.initialStateName,
    this.initialLgaName,
    this.initialWardName,
    this.initialPuName,
    required this.onChanged,
  });

  @override
  ConsumerState<VotingLocationPicker> createState() =>
      _VotingLocationPickerState();
}

class _VotingLocationPickerState
    extends ConsumerState<VotingLocationPicker> {
  NigeriaLocation? _state;
  NigeriaLocation? _lga;
  NigeriaLocation? _ward;
  NigeriaLocation? _pu;

  bool _prefilledState = false;
  bool _prefilledLga = false;
  bool _prefilledWard = false;
  bool _prefilledPu = false;

  NigeriaLocation? _findByName(List<NigeriaLocation> list, String? name) {
    if (name == null || name.trim().isEmpty) return null;
    final t = name.trim().toLowerCase();
    for (final l in list) {
      if (l.name.toLowerCase() == t) return l;
    }
    return null;
  }

  void _emit() {
    widget.onChanged(VotingLocationSelection(
      state: _state,
      lga: _lga,
      ward: _ward,
      pu: _pu,
    ));
  }

  void _prefillState(List<NigeriaLocation> states) {
    if (_prefilledState) return;
    _prefilledState = true;
    final match = _findByName(states, widget.initialStateName);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() => _state = match);
          _emit();
        }
      });
    }
  }

  void _prefillLga(List<NigeriaLocation> lgas) {
    if (_prefilledLga) return;
    _prefilledLga = true;
    final match = _findByName(lgas, widget.initialLgaName);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() => _lga = match);
          _emit();
        }
      });
    }
  }

  void _prefillWard(List<NigeriaLocation> wards) {
    if (_prefilledWard) return;
    _prefilledWard = true;
    final match = _findByName(wards, widget.initialWardName);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() => _ward = match);
          _emit();
        }
      });
    }
  }

  void _prefillPu(List<NigeriaLocation> pus) {
    if (_prefilledPu) return;
    _prefilledPu = true;
    final match = _findByName(pus, widget.initialPuName);
    if (match != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() => _pu = match);
          _emit();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final statesAsync = ref.watch(nigeriaStatesProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // State
        statesAsync.when(
          loading: () => _loading('Voting State'),
          error: (_, __) => _error('Voting State'),
          data: (states) {
            _prefillState(states);
            return _locationDropdown(
              label: 'Voting State',
              value: _state?.name,
              items: states,
              onChanged: (loc) {
                setState(() {
                  _state = loc;
                  _lga = null;
                  _ward = null;
                  _pu = null;
                  _prefilledLga = true;
                  _prefilledWard = true;
                  _prefilledPu = true;
                });
                _emit();
              },
            );
          },
        ),
        const SizedBox(height: 16),

        // LGA
        if (_state != null)
          ref.watch(nigeriaLGAsProvider(_state!.id)).when(
                loading: () => _loading('LGA'),
                error: (_, __) => _error('LGA'),
                data: (lgas) {
                  _prefillLga(lgas);
                  return _locationDropdown(
                    label: 'LGA',
                    value: _lga?.name,
                    items: lgas,
                    onChanged: (loc) {
                      setState(() {
                        _lga = loc;
                        _ward = null;
                        _pu = null;
                        _prefilledWard = true;
                        _prefilledPu = true;
                      });
                      _emit();
                    },
                  );
                },
              )
        else
          _disabled('LGA', 'Select a state first'),
        const SizedBox(height: 16),

        // Ward
        if (_lga != null)
          ref.watch(nigeriaWardsProvider(_lga!.id)).when(
                loading: () => _loading('Ward'),
                error: (_, __) => _error('Ward'),
                data: (wards) {
                  _prefillWard(wards);
                  return _locationDropdown(
                    label: 'Ward',
                    value: _ward?.name,
                    items: wards,
                    onChanged: (loc) {
                      setState(() {
                        _ward = loc;
                        _pu = null;
                        _prefilledPu = true;
                      });
                      _emit();
                    },
                  );
                },
              )
        else
          _disabled('Ward', 'Select an LGA first'),
        const SizedBox(height: 16),

        // PU
        if (_ward != null)
          ref.watch(nigeriaPollingUnitsProvider(_ward!.id)).when(
                loading: () => _loading('Polling Unit'),
                error: (_, __) => _error('Polling Unit'),
                data: (pus) {
                  _prefillPu(pus);
                  return _locationDropdown(
                    label: 'Polling Unit',
                    value: _pu?.name,
                    items: pus,
                    onChanged: (loc) {
                      setState(() => _pu = loc);
                      _emit();
                    },
                  );
                },
              )
        else
          _disabled('Polling Unit', 'Select a ward first'),
      ],
    );
  }

  Widget _locationDropdown({
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
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide:
                  const BorderSide(color: AppColors.primary, width: 1.5),
            ),
          ),
          items: items
              .map((l) => DropdownMenuItem(
                    value: l.name,
                    child: Text(l.name, overflow: TextOverflow.ellipsis),
                  ))
              .toList(),
          onChanged: (name) {
            if (name == null) {
              onChanged(null);
              return;
            }
            final loc = items.firstWhere((l) => l.name == name);
            onChanged(loc);
          },
        ),
      ],
    );
  }

  Widget _loading(String label) {
    final appC = context.appColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: appC.textSecondary,
            )),
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
          child: Row(children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: appC.textMuted,
              ),
            ),
            const SizedBox(width: 12),
            Text('Loading...',
                style: TextStyle(fontSize: 13, color: appC.textMuted)),
          ]),
        ),
      ],
    );
  }

  Widget _error(String label) {
    final appC = context.appColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: appC.textSecondary,
            )),
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
          child: Text('Failed to load.',
              style: TextStyle(
                  fontSize: 13, color: AppColors.error.withOpacity(0.8))),
        ),
      ],
    );
  }

  Widget _disabled(String label, String hint) {
    final appC = context.appColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: appC.textSecondary,
            )),
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
          child: Text(hint,
              style: TextStyle(fontSize: 13, color: appC.textDisabled)),
        ),
      ],
    );
  }
}
