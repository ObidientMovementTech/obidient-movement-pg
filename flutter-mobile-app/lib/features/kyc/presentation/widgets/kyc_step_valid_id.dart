import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/utils/image_compressor.dart';
import '../providers/kyc_providers.dart';

class KycStepValidId extends ConsumerStatefulWidget {
  const KycStepValidId({super.key});

  @override
  ConsumerState<KycStepValidId> createState() => _KycStepValidIdState();
}

class _KycStepValidIdState extends ConsumerState<KycStepValidId> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _idNumberCtrl;
  String? _idType;
  String? _localPreviewPath;
  bool _compressing = false;

  static const _idTypes = [
    'NIN',
    "Driver's License",
    'International Passport',
    "Voter's Card",
  ];

  @override
  void initState() {
    super.initState();
    final form = ref.read(kycFormProvider);
    _idNumberCtrl = TextEditingController(text: form.idNumber ?? '');
    _idType = form.idType;
  }

  @override
  void dispose() {
    _idNumberCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );
    if (picked == null) return;

    setState(() {
      _compressing = true;
      _localPreviewPath = picked.path;
    });

    try {
      final base64 = await compressAndEncodeBase64(picked.path);
      ref.read(kycFormProvider.notifier).updateValidId(idImageBase64: base64);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to process image'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _compressing = false);
    }
  }

  Future<void> _onContinue() async {
    if (!_formKey.currentState!.validate()) return;

    final form = ref.read(kycFormProvider);
    final hasImage = form.idImageBase64 != null || form.idImageUrl != null;
    if (!hasImage) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload your ID document'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    HapticFeedback.mediumImpact();
    ref.read(kycFormProvider.notifier).updateValidId(
          idType: _idType,
          idNumber: _idNumberCtrl.text.trim(),
        );
    final ok = await ref.read(kycFormProvider.notifier).saveValidId();
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
    final form = ref.watch(kycFormProvider);
    final hasExistingUrl = form.idImageUrl != null;
    final hasLocalPreview = _localPreviewPath != null;
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          Text(
            'Valid ID Document',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: cs.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Upload a government-issued ID document.',
            style: TextStyle(fontSize: 13, color: appC.textMuted),
          ),
          const SizedBox(height: 24),

          // ── ID Type ─────────────────────────────────────────
          _buildLabel('ID Type'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _idType,
            isExpanded: true,
            dropdownColor: appC.elevated,
            style:
                TextStyle(fontSize: 14, color: cs.onSurface),
            decoration: _inputDecoration(),
            items: _idTypes
                .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                .toList(),
            onChanged: (v) => setState(() => _idType = v),
            validator: (v) => v == null ? 'Select an ID type' : null,
          ),
          const SizedBox(height: 16),

          // ── ID Number ───────────────────────────────────────
          _buildLabel('ID Number'),
          const SizedBox(height: 6),
          TextFormField(
            controller: _idNumberCtrl,
            style:
                TextStyle(fontSize: 14, color: cs.onSurface),
            decoration: _inputDecoration(hint: 'e.g. 12345678901'),
            validator: (v) => (v == null || v.trim().isEmpty)
                ? 'ID number is required'
                : null,
          ),
          const SizedBox(height: 20),

          // ── ID Image ────────────────────────────────────────
          _buildLabel('ID Document Photo'),
          const SizedBox(height: 8),

          GestureDetector(
            onTap: _compressing ? null : _pickImage,
            child: Container(
              height: 180,
              decoration: BoxDecoration(
                color: appC.elevated,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: cs.outline,
                  style: BorderStyle.solid,
                ),
              ),
              child: _compressing
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          const SizedBox(height: 8),
                          Text('Compressing...',
                              style: TextStyle(
                                  fontSize: 12,
                                  color: appC.textMuted)),
                        ],
                      ),
                    )
                  : hasLocalPreview
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            File(_localPreviewPath!),
                            fit: BoxFit.cover,
                            width: double.infinity,
                            errorBuilder: (_, __, ___) => _placeholderContent(),
                          ),
                        )
                      : hasExistingUrl
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: CachedNetworkImage(
                                imageUrl: form.idImageUrl!,
                                fit: BoxFit.cover,
                                width: double.infinity,
                                placeholder: (_, __) => const Center(
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2),
                                ),
                                errorWidget: (_, __, ___) =>
                                    _placeholderContent(),
                              ),
                            )
                          : _placeholderContent(),
            ),
          ),
          if (hasLocalPreview || hasExistingUrl)
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: _pickImage,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Change photo',
                    style: TextStyle(fontSize: 13)),
                style: TextButton.styleFrom(foregroundColor: AppColors.primary),
              ),
            ),
          const SizedBox(height: 32),

          // ── Continue ────────────────────────────────────────
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: form.isSaving ? null : _onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: form.isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Continue',
                      style:
                          TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _placeholderContent() {
    final appC = context.appColors;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.cloud_upload_outlined,
              size: 36, color: appC.textMuted),
          const SizedBox(height: 8),
          Text('Tap to upload ID photo',
              style: TextStyle(fontSize: 13, color: appC.textMuted)),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    final appC = context.appColors;
    return Text(
      text,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: appC.textSecondary,
      ),
    );
  }

  InputDecoration _inputDecoration({String? hint}) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;
    return InputDecoration(
      filled: true,
      fillColor: appC.elevated,
      hintText: hint,
      hintStyle: TextStyle(color: appC.textDisabled),
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
        borderSide: BorderSide(color: cs.primary, width: 1.5),
      ),
    );
  }
}
