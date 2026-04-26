import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_providers.dart';

/// Shows the flyer generator as a full-screen modal bottom sheet.
void showFlyerGenerator(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _FlyerSheet(),
  );
}

class _FlyerSheet extends ConsumerStatefulWidget {
  const _FlyerSheet();

  @override
  ConsumerState<_FlyerSheet> createState() => _FlyerSheetState();
}

class _FlyerSheetState extends ConsumerState<_FlyerSheet> {
  final GlobalKey _flyerKey = GlobalKey();
  bool _isExporting = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = ref.watch(currentUserProvider);
    final userName = user?.name ?? 'Obidient Member';
    final profileImageUrl = user?.profileImage;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // ── Handle + Title ──────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: Column(
              children: [
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
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(
                      Icons.image_rounded,
                      size: 20,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Your Mobilization Flyer',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Share this flyer to mobilize voters to join your bloc.',
                  style: TextStyle(
                    fontSize: 13,
                    color: theme.colorScheme.onSurface.withOpacity(0.45),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Flyer Preview ───────────────────────────────────
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: RepaintBoundary(
                  key: _flyerKey,
                  child: _FlyerCanvas(
                    userName: userName,
                    profileImageUrl: profileImageUrl,
                  ),
                ),
              ),
            ),
          ),

          // ── Action Buttons ──────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  // Download button
                  Expanded(
                    child: _ExportButton(
                      icon: Icons.download_rounded,
                      label: 'Save',
                      onTap: _isExporting ? null : () => _export(save: true),
                      theme: theme,
                      isPrimary: false,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Share button
                  Expanded(
                    flex: 2,
                    child: _ExportButton(
                      icon: Icons.share_rounded,
                      label: _isExporting ? 'Exporting...' : 'Share Flyer',
                      onTap: _isExporting ? null : () => _export(save: false),
                      theme: theme,
                      isPrimary: true,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _export({required bool save}) async {
    setState(() => _isExporting = true);
    HapticFeedback.mediumImpact();

    try {
      // Capture the RepaintBoundary as an image at 3x for high quality
      final boundary = _flyerKey.currentContext?.findRenderObject()
          as RenderRepaintBoundary?;
      if (boundary == null) return;

      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData =
          await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;

      final pngBytes = byteData.buffer.asUint8List();

      // Save to temp file
      final tempDir = await getTemporaryDirectory();
      final user = ref.read(currentUserProvider);
      final safeName = (user?.name ?? 'obidient')
          .replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')
          .toLowerCase();
      final file = File(
          '${tempDir.path}/${safeName}_mobilization_flyer.png');
      await file.writeAsBytes(pngBytes);

      if (save) {
        // Save to gallery via share (iOS/Android handle differently)
        await Share.shareXFiles(
          [XFile(file.path)],
          text: 'My Obidient Mobilization Flyer',
        );
      } else {
        // Share with message
        await Share.shareXFiles(
          [XFile(file.path)],
          text:
              'I am mobilizing voters for Peter Obi! Join my voting bloc on Obidients.com 🇳🇬\n\n#ObidientMovement',
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to export flyer'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isExporting = false);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// FLYER CANVAS — the actual flyer widget that gets captured
// ═══════════════════════════════════════════════════════════════════

class _FlyerCanvas extends StatelessWidget {
  final String userName;
  final String? profileImageUrl;

  const _FlyerCanvas({
    required this.userName,
    this.profileImageUrl,
  });

  @override
  Widget build(BuildContext context) {
    // 4:5 aspect ratio (360×450 design → 540×675 export)
    return AspectRatio(
      aspectRatio: 4 / 5,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // ── Background image ──────────────────────────
            Image.asset(
              'assets/images/mobilize-dp.png',
              fit: BoxFit.fill,
            ),

            // ── User overlay at ~13% from top ─────────────
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              // 13% from top, occupying ~40% height for the overlay zone
              child: FractionallySizedBox(
                widthFactor: 1.0,
                child: Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: SizedBox(
                    height: 240, // enough space for the overlay content
                    child: Stack(
                      children: [
                        // Name + "Mobilizer" on the left
                        Positioned(
                          left: 16,
                          top: 95,
                          right: 170, // expands rightward but leaves room for photo
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                userName,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF1A1A1A),
                                  height: 1.15,
                                  letterSpacing: -0.3,
                                ),
                              ),
                              const SizedBox(height: 5),
                              const Text(
                                'Mobilizer',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF555555),
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Profile photo on the right
                        Positioned(
                          right: 24,
                          top: 20,
                          child: Container(
                            width: 155,
                            height: 155,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: Colors.white, width: 3),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.15),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: profileImageUrl != null &&
                                      profileImageUrl!.isNotEmpty
                                  ? CachedNetworkImage(
                                      imageUrl: profileImageUrl!,
                                      fit: BoxFit.cover,
                                      placeholder: (_, __) =>
                                          _AvatarFallback(name: userName),
                                      errorWidget: (_, __, ___) =>
                                          _AvatarFallback(name: userName),
                                    )
                                  : _AvatarFallback(name: userName),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AvatarFallback extends StatelessWidget {
  final String name;
  const _AvatarFallback({required this.name});

  @override
  Widget build(BuildContext context) {
    final initials = name
        .split(' ')
        .take(2)
        .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '')
        .join();

    return Container(
      color: const Color(0xFFE5E7EB),
      child: Center(
        child: Text(
          initials.isEmpty ? 'O' : initials,
          style: const TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w700,
            color: Color(0xFF4B5563),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT BUTTON
// ═══════════════════════════════════════════════════════════════════

class _ExportButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final ThemeData theme;
  final bool isPrimary;

  const _ExportButton({
    required this.icon,
    required this.label,
    required this.onTap,
    required this.theme,
    required this.isPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isPrimary
          ? AppColors.primary
          : theme.colorScheme.onSurface.withOpacity(0.06),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: isPrimary
                    ? Colors.white
                    : theme.colorScheme.onSurface.withOpacity(0.6),
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isPrimary
                      ? Colors.white
                      : theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
