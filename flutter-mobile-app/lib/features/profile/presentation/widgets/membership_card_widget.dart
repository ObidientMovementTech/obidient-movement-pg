import 'dart:math' as math;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../auth/data/models/user.dart';

/// Card colors — matching web MemberCardPage.tsx exactly.
const _kPrimary = Color(0xFF006837);
const _kMid = Color(0xFF004D2A);
const _kAccent = Color(0xFF8CC63F);
const _kWatermark = Color(0x99FF5050); // rgba(255,80,80,0.6)

/// The membership card visual — designed to pixel-match the web app.
/// Wrap in a [RepaintBoundary] with a [GlobalKey] for image capture.
class MembershipCardWidget extends StatelessWidget {
  final User user;

  const MembershipCardWidget({super.key, required this.user});

  bool get _isVerified => user.kycStatus == 'approved';

  String get _registeredDate {
    final d = user.createdAt;
    if (d == null) return 'N/A';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[d.month - 1]}, ${d.year}';
  }

  String get _memberId =>
      user.id.length >= 8 ? user.id.substring(user.id.length - 8).toUpperCase() : user.id.toUpperCase();

  String get _state => user.votingState ?? user.stateOfOrigin ?? '—';

  String get _wardLga =>
      [user.votingWard, user.votingLGA].where((s) => s != null && s.isNotEmpty).join(', ');

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.6,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            begin: Alignment(-0.7, -0.7), // ~135deg
            end: Alignment(0.7, 0.7),
            colors: [_kPrimary, _kMid, _kAccent],
            stops: [0.0, 0.6, 1.0],
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x40006837), // rgba(0,104,55,0.25)
              blurRadius: 64,
              offset: Offset(0, 24),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // ── Decorative circles ──
            Positioned(
              top: -60,
              right: -60,
              child: Container(
                width: 200,
                height: 200,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0x0FFFFFFF), // 6% white
                ),
              ),
            ),
            Positioned(
              bottom: -40,
              left: -40,
              child: Container(
                width: 160,
                height: 160,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0x0AFFFFFF), // 4% white
                ),
              ),
            ),

            // ── UNVERIFIED watermark ──
            if (!_isVerified)
              Positioned.fill(
                child: Center(
                  child: Transform.rotate(
                    angle: -25 * math.pi / 180,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 32, vertical: 8),
                      decoration: BoxDecoration(
                        border: Border.all(color: _kWatermark, width: 3),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'UNVERIFIED',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: _kWatermark,
                          letterSpacing: 4,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

            // ── Card content ──
            Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildTopRow(),
                  _buildMiddleRow(),
                  _buildBottomRow(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Top row: Logo + Member Since ──
  Widget _buildTopRow() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Logo + label
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Opacity(
                opacity: 0.9,
                child: SvgPicture.asset(
                  'assets/images/obidientLogo.svg',
                  height: 28,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'MEMBERSHIP CARD',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withOpacity(0.7),
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
        ),
        // Member Since
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'Member Since',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                color: Colors.white.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              _registeredDate,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ── Middle row: Photo + Name/Location ──
  Widget _buildMiddleRow() {
    final profileImage = user.profileImage;
    final initial = user.name.isNotEmpty ? user.name[0].toUpperCase() : '?';

    return Row(
      children: [
        // Photo container
        Container(
          width: 64,
          height: 78,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: Colors.white.withOpacity(0.3),
              width: 2,
            ),
            color: Colors.white.withOpacity(0.15),
          ),
          clipBehavior: Clip.antiAlias,
          child: profileImage != null && profileImage.isNotEmpty
              ? CachedNetworkImage(
                  imageUrl: profileImage,
                  fit: BoxFit.cover,
                  width: 64,
                  height: 78,
                  placeholder: (_, __) => Center(
                    child: Text(
                      initial,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  errorWidget: (_, __, ___) => Center(
                    child: Text(
                      initial,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                )
              : Center(
                  child: Text(
                    initial,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
        ),
        const SizedBox(width: 20),
        // Name + location
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                user.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              if (user.votingPU != null && user.votingPU!.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  user.votingPU!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
              if (_wardLga.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  _wardLga,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  // ── Bottom row: Member ID + State ──
  Widget _buildBottomRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Member ID
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Member ID',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              _memberId,
              style: GoogleFonts.robotoMono(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.white,
                letterSpacing: 2,
              ),
            ),
          ],
        ),
        // State
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'State',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              _state,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
