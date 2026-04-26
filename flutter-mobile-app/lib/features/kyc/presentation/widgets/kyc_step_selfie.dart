import 'dart:io';

import 'package:camera/camera.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/utils/image_compressor.dart';
import '../providers/kyc_providers.dart';

class KycStepSelfie extends ConsumerStatefulWidget {
  const KycStepSelfie({super.key});

  @override
  ConsumerState<KycStepSelfie> createState() => _KycStepSelfieState();
}

class _KycStepSelfieState extends ConsumerState<KycStepSelfie>
    with WidgetsBindingObserver {
  CameraController? _cameraCtrl;
  bool _isCameraReady = false;
  String? _capturedPath;
  String? _cameraError;
  bool _processing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    final form = ref.read(kycFormProvider);
    if (form.selfiePreviewUrl == null) {
      _initCamera();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraCtrl?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_cameraCtrl == null || !_cameraCtrl!.value.isInitialized) return;
    if (state == AppLifecycleState.inactive) {
      _cameraCtrl?.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initCamera();
    }
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      final front = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _cameraCtrl = CameraController(
        front,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await _cameraCtrl!.initialize();
      if (mounted) {
        setState(() {
          _isCameraReady = true;
          _cameraError = null;
        });
      }
    } on CameraException catch (e) {
      setState(() {
        _cameraError = _humanizeError(e.code);
      });
    } catch (_) {
      setState(() {
        _cameraError = 'Could not access the camera.';
      });
    }
  }

  String _humanizeError(String code) {
    switch (code) {
      case 'CameraAccessDenied':
      case 'CameraAccessDeniedWithoutPrompt':
      case 'CameraAccessRestricted':
        return 'Camera access was denied. Please enable it in your device settings.';
      default:
        return 'Camera is not available. Please check your device.';
    }
  }

  Future<void> _capture() async {
    if (_cameraCtrl == null || !_cameraCtrl!.value.isInitialized) return;
    HapticFeedback.mediumImpact();

    setState(() => _processing = true);

    try {
      final file = await _cameraCtrl!.takePicture();
      final base64 = await compressAndEncodeBase64(file.path);

      ref.read(kycFormProvider.notifier).updateSelfie(selfieBase64: base64);
      setState(() {
        _capturedPath = file.path;
        _processing = false;
      });

      // Stop camera after capture
      await _cameraCtrl?.dispose();
      _cameraCtrl = null;
      _isCameraReady = false;
    } catch (e) {
      setState(() => _processing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to capture selfie'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _retake() {
    setState(() {
      _capturedPath = null;
    });
    ref.read(kycFormProvider.notifier).clearSelfie();
    _initCamera();
  }

  Future<void> _submit() async {
    final form = ref.read(kycFormProvider);
    final hasSelfie =
        (form.selfieBase64 != null && form.selfieBase64!.isNotEmpty) ||
            form.selfiePreviewUrl != null;

    if (!hasSelfie) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please capture a selfie to proceed'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    HapticFeedback.mediumImpact();
    final ok =
        await ref.read(kycFormProvider.notifier).saveSelfieAndSubmit();
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ref.read(kycFormProvider).error ?? 'Submission failed'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final form = ref.watch(kycFormProvider);
    final hasExistingUrl = form.selfiePreviewUrl != null;
    final hasCaptured = _capturedPath != null;
    final showPreview = hasCaptured || hasExistingUrl;
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      children: [
        Text(
          'Selfie Capture',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: cs.onSurface,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Take a clear photo of your face for identity verification.',
          style: TextStyle(fontSize: 13, color: appC.textMuted),
        ),
        const SizedBox(height: 24),

        // ── Camera / Preview area ─────────────────────────────
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: AspectRatio(
            aspectRatio: 3 / 4,
            child: Container(
              color: cs.surface,
              child: showPreview
                  ? _buildPreview(hasCaptured)
                  : _cameraError != null
                      ? _buildCameraError()
                      : _isCameraReady
                          ? CameraPreview(_cameraCtrl!)
                          : const Center(
                              child: CircularProgressIndicator(
                                  strokeWidth: 2),
                            ),
            ),
          ),
        ),
        const SizedBox(height: 20),

        // ── Action buttons ────────────────────────────────────
        if (!showPreview && _isCameraReady)
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _processing ? null : _capture,
              icon: _processing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.camera_alt_rounded),
              label: Text(_processing ? 'Processing...' : 'Capture Selfie'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
                textStyle:
                    const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
            ),
          ),

        if (_cameraError != null && !hasExistingUrl)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: OutlinedButton.icon(
              onPressed: _initCamera,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Retry Camera'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),

        if (showPreview) ...[
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _retake,
                  icon: const Icon(Icons.refresh, size: 18),
                  label: const Text('Retake'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: appC.textSecondary,
                    side: BorderSide(color: cs.outline),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    minimumSize: const Size(0, 52),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: form.isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                    minimumSize: const Size(0, 52),
                  ),
                  child: form.isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Finish & Submit',
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildPreview(bool isLocal) {
    if (isLocal && _capturedPath != null) {
      return Image.file(
        File(_capturedPath!),
        fit: BoxFit.cover,
        width: double.infinity,
      );
    }
    final url = ref.read(kycFormProvider).selfiePreviewUrl;
    if (url != null) {
      return CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        width: double.infinity,
        placeholder: (_, __) =>
            const Center(child: CircularProgressIndicator(strokeWidth: 2)),
        errorWidget: (_, __, ___) => _buildCameraError(),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildCameraError() {
    final appC = context.appColors;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.no_photography_outlined,
                size: 40, color: appC.textMuted),
            const SizedBox(height: 12),
            Text(
              _cameraError ?? 'Camera not available',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: appC.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
