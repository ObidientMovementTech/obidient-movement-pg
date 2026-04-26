import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/kyc_remote_datasource.dart';
import '../../data/models/kyc_data.dart';
import '../../data/models/kyc_personal_info.dart';

// ── Datasource ──────────────────────────────────────────────────
final kycDsProvider = Provider<KycRemoteDataSource>((ref) {
  return KycRemoteDataSource(ref.watch(apiClientProvider));
});

// ── Fetch existing KYC data on mount ────────────────────────────
final kycDataProvider = FutureProvider.autoDispose<KycData>((ref) {
  return ref.watch(kycDsProvider).getMyKyc();
});

// ── Form state ──────────────────────────────────────────────────
class KycFormState {
  final int currentStep;
  final KycPersonalInfo personalInfo;
  final String? idType;
  final String? idNumber;
  final String? idImageBase64;
  final String? idImageUrl;
  final String? selfieBase64;
  final String? selfiePreviewUrl;
  final bool isSaving;
  final bool isSubmitting;
  final String? error;
  final bool isSuccess;

  const KycFormState({
    this.currentStep = 0,
    this.personalInfo = const KycPersonalInfo(),
    this.idType,
    this.idNumber,
    this.idImageBase64,
    this.idImageUrl,
    this.selfieBase64,
    this.selfiePreviewUrl,
    this.isSaving = false,
    this.isSubmitting = false,
    this.error,
    this.isSuccess = false,
  });

  KycFormState copyWith({
    int? currentStep,
    KycPersonalInfo? personalInfo,
    String? idType,
    String? idNumber,
    String? idImageBase64,
    String? idImageUrl,
    String? selfieBase64,
    String? selfiePreviewUrl,
    bool? isSaving,
    bool? isSubmitting,
    String? error,
    bool? isSuccess,
  }) {
    return KycFormState(
      currentStep: currentStep ?? this.currentStep,
      personalInfo: personalInfo ?? this.personalInfo,
      idType: idType ?? this.idType,
      idNumber: idNumber ?? this.idNumber,
      idImageBase64: idImageBase64 ?? this.idImageBase64,
      idImageUrl: idImageUrl ?? this.idImageUrl,
      selfieBase64: selfieBase64 ?? this.selfieBase64,
      selfiePreviewUrl: selfiePreviewUrl ?? this.selfiePreviewUrl,
      isSaving: isSaving ?? this.isSaving,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

class KycFormNotifier extends StateNotifier<KycFormState> {
  final KycRemoteDataSource _ds;
  final Ref _ref;
  KycFormNotifier(this._ds, this._ref) : super(const KycFormState());

  /// Pre-populate from existing KYC data (draft / rejected).
  /// Steps: 0 = Valid ID, 1 = Selfie.
  void loadExisting(KycData data) {
    int startStep = 0;
    if (data.validID?.idType != null && data.validID?.idNumber != null) {
      startStep = 1; // valid ID done, go to selfie
    }

    state = state.copyWith(
      currentStep: startStep,
      idType: data.validID?.idType,
      idNumber: data.validID?.idNumber,
      idImageUrl: data.validID?.idImageUrl,
      selfiePreviewUrl: data.selfieImageUrl,
    );
  }

  void setStep(int step) {
    state = state.copyWith(currentStep: step);
  }

  void updatePersonalInfo(KycPersonalInfo info) {
    state = state.copyWith(personalInfo: info);
  }

  void updateValidId({String? idType, String? idNumber, String? idImageBase64}) {
    state = state.copyWith(
      idType: idType ?? state.idType,
      idNumber: idNumber ?? state.idNumber,
      idImageBase64: idImageBase64 ?? state.idImageBase64,
    );
  }

  void updateSelfie({String? selfieBase64, String? selfiePreviewUrl}) {
    state = state.copyWith(
      selfieBase64: selfieBase64 ?? state.selfieBase64,
      selfiePreviewUrl: selfiePreviewUrl ?? state.selfiePreviewUrl,
    );
  }

  void clearSelfie() {
    state = KycFormState(
      currentStep: state.currentStep,
      personalInfo: state.personalInfo,
      idType: state.idType,
      idNumber: state.idNumber,
      idImageBase64: state.idImageBase64,
      idImageUrl: state.idImageUrl,
      isSaving: state.isSaving,
      isSubmitting: state.isSubmitting,
      error: state.error,
      isSuccess: state.isSuccess,
    );
  }

  // ── Save personal info (Step 1) ──────────────────────────────
  Future<bool> savePersonalInfo() async {
    state = state.copyWith(isSaving: true, error: null);
    try {
      await _ds.savePersonalInfo(state.personalInfo);
      state = state.copyWith(isSaving: false, currentStep: 1);
      return true;
    } catch (e) {
      state = state.copyWith(isSaving: false, error: e.toString());
      return false;
    }
  }

  // ── Save valid ID (Step 2) ───────────────────────────────────
  Future<bool> saveValidId() async {
    final idType = state.idType;
    final idNumber = state.idNumber;
    if (idType == null || idNumber == null) {
      state = state.copyWith(error: 'ID type and number are required');
      return false;
    }
    state = state.copyWith(isSaving: true, error: null);
    try {
      final result = await _ds.saveValidId(
        idType: idType,
        idNumber: idNumber,
        idImageBase64: state.idImageBase64,
      );
      state = state.copyWith(
        isSaving: false,
        currentStep: 1, // advance to selfie
        idImageUrl: result.idImageUrl,
        idImageBase64: null, // clear base64 after upload
      );
      return true;
    } catch (e) {
      state = state.copyWith(isSaving: false, error: e.toString());
      return false;
    }
  }

  // ── Save selfie + submit (Step 3) ────────────────────────────
  Future<bool> saveSelfieAndSubmit() async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      // Save selfie if we have a new one
      if (state.selfieBase64 != null && state.selfieBase64!.isNotEmpty) {
        final url = await _ds.saveSelfie(state.selfieBase64!);
        state = state.copyWith(selfiePreviewUrl: url, selfieBase64: null);
      }

      // Submit KYC
      await _ds.submitKyc(
        validIDType: state.idType!,
        validIDNumber: state.idNumber!,
      );

      // Refresh auth state so user.kycStatus updates across the app.
      try {
        final updatedUser =
            await _ref.read(authDataSourceProvider).getCurrentUser();
        _ref.read(authStateProvider.notifier).state =
            AuthState.authenticated(updatedUser);
      } catch (_) {
        // Non-fatal: KYC submitted; stale user will refresh on next fetch.
      }

      state = state.copyWith(isSubmitting: false, isSuccess: true);
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }
}

final kycFormProvider =
    StateNotifierProvider.autoDispose<KycFormNotifier, KycFormState>((ref) {
  return KycFormNotifier(ref.watch(kycDsProvider), ref);
});
