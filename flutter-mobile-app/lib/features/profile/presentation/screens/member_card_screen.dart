import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../widgets/membership_card_widget.dart';

const _kPrimary = Color(0xFF006837);

class MemberCardScreen extends ConsumerStatefulWidget {
  const MemberCardScreen({super.key});

  @override
  ConsumerState<MemberCardScreen> createState() => _MemberCardScreenState();
}

class _MemberCardScreenState extends ConsumerState<MemberCardScreen> {
  final _cardKey = GlobalKey();
  bool _isExporting = false;

  Future<void> _handleDownload() async {
    final user = ref.read(currentUserProvider);
    if (user == null || user.kycStatus != 'approved') return;

    setState(() => _isExporting = true);
    HapticFeedback.mediumImpact();

    try {
      final boundary = _cardKey.currentContext?.findRenderObject()
          as RenderRepaintBoundary?;
      if (boundary == null) return;

      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData =
          await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;

      final pngBytes = byteData.buffer.asUint8List();

      final tempDir = await getTemporaryDirectory();
      final safeName = user.name
          .replaceAll(RegExp(r'[^a-zA-Z0-9]'), '-')
          .toLowerCase();
      final file = File('${tempDir.path}/obidient-card-$safeName.png');
      await file.writeAsBytes(pngBytes);

      // Use share to save — iOS/Android handle gallery save differently
      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'My Obidient Movement Membership Card',
      );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not generate card image. Try again.'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isExporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final user = ref.watch(currentUserProvider);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Membership Card')),
        body: const Center(child: Text('Please log in to view your card.')),
      );
    }

    final isVerified = user.kycStatus == 'approved';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Membership Card'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Page header ──
            Text(
              'Your official Obidient Movement membership card',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 14,
                color: isDark
                    ? AppColors.textSecondary
                    : AppColors.lightTextSecondary,
              ),
            ),
            const SizedBox(height: 24),

            // ── Card preview ──
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: RepaintBoundary(
                  key: _cardKey,
                  child: MembershipCardWidget(user: user),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // ── Status card ──
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.card : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? AppColors.border : AppColors.lightBorder,
                  width: 0.5,
                ),
              ),
              child: Row(
                children: [
                  // Status icon
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isVerified
                          ? AppColors.success.withOpacity(0.15)
                          : AppColors.warning.withOpacity(0.15),
                    ),
                    child: Icon(
                      isVerified
                          ? Icons.verified_user_rounded
                          : Icons.schedule_rounded,
                      size: 20,
                      color: isVerified ? _kPrimary : const Color(0xFFD97706),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Status text
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isVerified ? 'Card Active' : 'Pending Verification',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isVerified
                              ? 'Your identity is verified. Card is ready to download.'
                              : 'Complete KYC verification to activate your card.',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            color: isDark
                                ? AppColors.textMuted
                                : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Status chip
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isVerified
                          ? AppColors.success.withOpacity(0.12)
                          : AppColors.warning.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      user.kycStatus ?? 'pending',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color:
                            isVerified ? AppColors.success : AppColors.warning,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── KYC warning ──
            if (!isVerified) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.warning.withOpacity(0.2),
                    width: 0.5,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded,
                            size: 18, color: Color(0xFFD97706)),
                        const SizedBox(width: 8),
                        Text(
                          'KYC Not Complete',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFD97706),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your card shows an "UNVERIFIED" watermark. Complete identity verification to remove it and enable downloads.',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        GoRouter.of(context).push('/settings/kyc');
                      },
                      child: Text(
                        'Complete Verification →',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFFD97706),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // ── Download button ──
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton.icon(
                onPressed: isVerified && !_isExporting ? _handleDownload : null,
                icon: _isExporting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.download_rounded, size: 18),
                label: Text(
                  _isExporting
                      ? 'Generating...'
                      : isVerified
                          ? 'Download Card'
                          : 'Verify Identity to Download',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: _kPrimary,
                  disabledBackgroundColor: isDark
                      ? AppColors.elevated
                      : const Color(0xFFE5E5E5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),

            // ── Disabled hint ──
            if (!isVerified) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      size: 14, color: Color(0xFFD97706)),
                  const SizedBox(width: 6),
                  Text(
                    'Download is disabled until KYC is approved',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      color: isDark
                          ? AppColors.textMuted
                          : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
