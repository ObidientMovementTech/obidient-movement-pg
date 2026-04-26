import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/in_app_webview.dart';
import '../../data/models/voting_bloc.dart';

/// Shows a share bottom sheet with copy link + native share.
void showShareBloc(BuildContext context, VotingBloc bloc) {
  final joinCode = bloc.joinCode ?? '';
  final joinUrl = 'https://www.obidients.com/voting-bloc/$joinCode';

  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (ctx) {
      final theme = Theme.of(ctx);
      return Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        decoration: BoxDecoration(
          color: theme.scaffoldBackgroundColor,
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle
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
                  const Icon(Icons.share_rounded,
                      size: 20, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    'Share Your Bloc',
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
                'Invite people to join your voting bloc.',
                style: TextStyle(
                  fontSize: 13,
                  color: theme.colorScheme.onSurface.withOpacity(0.45),
                ),
              ),
              const SizedBox(height: 20),

              // ── Copy link field ─────────────────────────────
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurface.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: theme.colorScheme.outline.withOpacity(0.12),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        joinUrl,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 13,
                          color:
                              theme.colorScheme.onSurface.withOpacity(0.5),
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        Clipboard.setData(ClipboardData(text: joinUrl));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                Icon(Icons.check_circle_rounded, size: 16, color: Colors.white.withOpacity(0.9)),
                                const SizedBox(width: 8),
                                const Text(
                                  'Link copied to clipboard',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            backgroundColor: const Color(0xFF1A1A1A),
                            duration: const Duration(seconds: 2),
                            behavior: SnackBarBehavior.floating,
                            margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 0,
                          ),
                        );
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                      ),
                      child: const Text(
                        'Copy',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // ── Share actions ────────────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _ShareIcon(
                    icon: FontAwesomeIcons.whatsapp,
                    label: 'WhatsApp',
                    color: const Color(0xFF25D366),
                    onTap: () => _shareVia(
                      'https://wa.me/?text=${Uri.encodeComponent(_shareText(bloc, joinUrl))}',
                    ),
                  ),
                  _ShareIcon(
                    icon: FontAwesomeIcons.xTwitter,
                    label: 'Twitter',
                    color: const Color(0xFF000000),
                    onTap: () => _shareVia(
                      'https://twitter.com/intent/tweet?text=${Uri.encodeComponent(_shareText(bloc, joinUrl))}',
                    ),
                  ),
                  _ShareIcon(
                    icon: FontAwesomeIcons.facebookF,
                    label: 'Facebook',
                    color: const Color(0xFF1877F2),
                    onTap: () => _shareVia(
                      'https://www.facebook.com/sharer/sharer.php?quote=${Uri.encodeComponent(_shareText(bloc, joinUrl))}',
                    ),
                  ),
                  _ShareIcon(
                    icon: FontAwesomeIcons.telegram,
                    label: 'Telegram',
                    color: const Color(0xFF0088CC),
                    onTap: () => _shareVia(
                      'https://t.me/share/url?url=${Uri.encodeComponent(joinUrl)}&text=${Uri.encodeComponent(_shareText(bloc, joinUrl))}',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Native share button ─────────────────────────
              SizedBox(
                width: double.infinity,
                child: Material(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.mediumImpact();
                      Share.share(_shareText(bloc, joinUrl));
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 14),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.share_rounded,
                              size: 18, color: Colors.white),
                          SizedBox(width: 8),
                          Text(
                            'Share via...',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // ── Open in browser ─────────────────────────────
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    InAppWebView.route(
                      url: joinUrl,
                      title: 'Your Voting Bloc',
                    ),
                  );
                },
                child: Text(
                  'View Public Page',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withOpacity(0.4),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

String _shareText(VotingBloc bloc, String url) {
  return 'Join my voting bloc "${bloc.name}" on Obidients.com and let\'s mobilize for a better Nigeria! 🇳🇬\n\n$url\n\n#ObidientMovement';
}

Future<void> _shareVia(String url) async {
  final uri = Uri.parse(url);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

class _ShareIcon extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ShareIcon({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: FaIcon(icon, size: 22, color: color),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurface.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }
}
