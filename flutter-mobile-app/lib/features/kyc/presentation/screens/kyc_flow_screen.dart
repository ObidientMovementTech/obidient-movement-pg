import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/kyc_providers.dart';
import '../widgets/kyc_progress_bar.dart';
import '../widgets/kyc_status_banner.dart';
import '../widgets/kyc_step_valid_id.dart';
import '../widgets/kyc_step_selfie.dart';

class KycFlowScreen extends ConsumerStatefulWidget {
  const KycFlowScreen({super.key});

  @override
  ConsumerState<KycFlowScreen> createState() => _KycFlowScreenState();
}

class _KycFlowScreenState extends ConsumerState<KycFlowScreen> {
  final _pageCtrl = PageController();
  bool _loaded = false;

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  void _animateToPage(int page) {
    _pageCtrl.animateToPage(
      page,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final kycDataAsync = ref.watch(kycDataProvider);
    final form = ref.watch(kycFormProvider);
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    // Load existing data once
    if (!_loaded) {
      kycDataAsync.whenData((data) {
        final status = data.kycStatus?.toLowerCase();
        if (status == 'draft' || status == 'rejected') {
          ref.read(kycFormProvider.notifier).loadExisting(data);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (_pageCtrl.hasClients) {
              _pageCtrl.jumpToPage(ref.read(kycFormProvider).currentStep);
            }
          });
        }
        _loaded = true;
      });
    }

    // Sync page with step changes from provider
    ref.listen<KycFormState>(kycFormProvider, (prev, next) {
      if (prev?.currentStep != next.currentStep && _pageCtrl.hasClients) {
        _animateToPage(next.currentStep);
      }
    });

    // Success state
    if (form.isSuccess) {
      return Scaffold(
        appBar: AppBar(
          elevation: 0,
          scrolledUnderElevation: 0,
          leading: IconButton(
            icon: Icon(Icons.close, color: cs.onSurface),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle_rounded,
                      size: 40, color: AppColors.success),
                ),
                const SizedBox(height: 20),
                Text(
                  'KYC Submitted!',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: cs.onSurface,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your documents are now being reviewed.\nYou\'ll be notified once verified.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: appC.textMuted,
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () => context.pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text('Back to Profile',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              size: 20, color: cs.onSurface),
          onPressed: () {
            if (form.currentStep > 0) {
              ref.read(kycFormProvider.notifier).setStep(form.currentStep - 1);
            } else {
              context.pop();
            }
          },
        ),
        title: Text(
          'KYC Verification',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: cs.onSurface,
          ),
        ),
        centerTitle: true,
      ),
      body: kycDataAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Failed to load KYC data',
                  style: TextStyle(color: cs.error)),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(kycDataProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (data) {
          final status = data.kycStatus?.toLowerCase() ?? 'unsubmitted';
          final isReadOnly = status == 'approved' || status == 'pending';

          return Column(
            children: [
              // Status banner (if applicable)
              if (status != 'unsubmitted')
                KycStatusBanner(
                  status: status,
                  rejectionReason: data.kycRejectionReason,
                ),

              // Progress bar
              KycProgressBar(
                currentStep: form.currentStep,
                onStepTap: isReadOnly
                    ? null
                    : (step) {
                        ref.read(kycFormProvider.notifier).setStep(step);
                      },
              ),

              // Block editing for approved/pending
              if (isReadOnly)
                Expanded(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            status == 'approved'
                                ? Icons.verified_rounded
                                : Icons.hourglass_top_rounded,
                            size: 48,
                            color: status == 'approved'
                                ? AppColors.success
                                : AppColors.warning,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            status == 'approved'
                                ? 'Your KYC is verified'
                                : 'KYC is under review',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: cs.onSurface,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            status == 'approved'
                                ? 'No changes are needed.'
                                : 'Please wait while your documents are being reviewed.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: appC.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                Expanded(
                  child: PageView(
                    controller: _pageCtrl,
                    physics: const NeverScrollableScrollPhysics(),
                    children: const [
                      KycStepValidId(),
                      KycStepSelfie(),
                    ],
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
