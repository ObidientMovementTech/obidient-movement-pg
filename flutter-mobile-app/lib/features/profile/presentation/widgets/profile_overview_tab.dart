import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class ProfileOverviewTab extends StatelessWidget {
  final dynamic user;
  const ProfileOverviewTab({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
      children: [
        // ── Personal Info ─────────────────────────────────────
        _SectionCard(
          theme: theme,
          title: 'Personal Information',
          rows: [
            _InfoRow('Full Name', user?.name ?? '—'),
            _InfoRow('Email', user?.email ?? '—'),
            _InfoRow('Phone', user?.phone ?? '—'),
            _InfoRow('Username', user?.userName != null ? '@${user!.userName}' : '—'),
            _InfoRow('Gender', _cap(user?.gender)),
            _InfoRow('Age Range', user?.ageRange ?? '—'),
            _InfoRow('Citizenship', _cap(user?.citizenship)),
            _InfoRow('State of Origin', user?.stateOfOrigin ?? '—'),
          ],
        ),
        const SizedBox(height: 16),

        // ── Voting Information ────────────────────────────────
        _SectionCard(
          theme: theme,
          title: 'Voting Information',
          rows: [
            _InfoRow('Registered Voter', _yesNo(user?.isVoter)),
            _InfoRow('Will Vote', _yesNo(user?.willVote)),
            _InfoRow('Voting State', user?.votingState ?? '—'),
            _InfoRow('LGA', user?.votingLGA ?? '—'),
            _InfoRow('Ward', user?.votingWard ?? '—'),
            _InfoRow('Polling Unit', user?.votingPU ?? '—'),
          ],
        ),
        const SizedBox(height: 16),

        // ── KYC Status ────────────────────────────────────────
        _KycCard(theme: theme, status: user?.kycStatus),
        const SizedBox(height: 16),

        // ── Account ───────────────────────────────────────────
        _SectionCard(
          theme: theme,
          title: 'Account',
          rows: [
            _InfoRow(
              'Member Since',
              user?.createdAt != null
                  ? DateFormat('MMM d, yyyy').format(user!.createdAt!)
                  : '—',
            ),
            _InfoRow('Designation', user?.designation ?? 'Community Member'),
          ],
        ),
      ],
    );
  }

  String _cap(String? val) {
    if (val == null || val.isEmpty) return '—';
    return val[0].toUpperCase() + val.substring(1);
  }

  String _yesNo(String? val) {
    if (val == null) return '—';
    final v = val.toLowerCase();
    if (v == 'yes' || v == 'true') return 'Yes';
    if (v == 'no' || v == 'false') return 'No';
    return val;
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION CARD — container with border, no shadow
// ═══════════════════════════════════════════════════════════════════

class _SectionCard extends StatelessWidget {
  final ThemeData theme;
  final String title;
  final List<_InfoRow> rows;
  const _SectionCard({
    required this.theme,
    required this.title,
    required this.rows,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 2),
            child: Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
            ),
          ),
          const SizedBox(height: 4),
          // Rows
          ...rows.asMap().entries.map((entry) {
            final isLast = entry.key == rows.length - 1;
            final row = entry.value;
            return _InfoRowWidget(
              label: row.label,
              value: row.value,
              theme: theme,
              showDivider: !isLast,
            );
          }),
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}

// ── Info Row Data ────────────────────────────────────────────────

class _InfoRow {
  final String label;
  final String value;
  const _InfoRow(this.label, this.value);
}

// ── Info Row Widget ──────────────────────────────────────────────

class _InfoRowWidget extends StatelessWidget {
  final String label;
  final String value;
  final ThemeData theme;
  final bool showDivider;
  const _InfoRowWidget({
    required this.label,
    required this.value,
    required this.theme,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 120,
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: theme.colorScheme.onSurface.withOpacity(0.4),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  value,
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withOpacity(0.85),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (showDivider)
          Divider(
            height: 1,
            thickness: 0.5,
            indent: 16,
            endIndent: 16,
            color: theme.colorScheme.outline.withOpacity(0.08),
          ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// KYC CARD
// ═══════════════════════════════════════════════════════════════════

class _KycCard extends StatelessWidget {
  final ThemeData theme;
  final String? status;
  const _KycCard({required this.theme, this.status});

  @override
  Widget build(BuildContext context) {
    final s = (status ?? 'not_started').toLowerCase();
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);

    String label;
    String description;
    IconData icon;
    Color statusColor;
    String? ctaLabel;

    switch (s) {
      case 'approved':
        label = 'Verified';
        description = 'Your identity has been verified.';
        icon = Icons.check_circle_outline_rounded;
        statusColor = const Color(0xFF34C759);
        ctaLabel = null;
        break;
      case 'pending':
        label = 'Pending Review';
        description = 'Your documents are being reviewed.';
        icon = Icons.hourglass_top_rounded;
        statusColor = const Color(0xFFFF9500);
        ctaLabel = null;
        break;
      case 'rejected':
        label = 'Rejected';
        description = 'Your submission was not approved. Please retry.';
        icon = Icons.error_outline_rounded;
        statusColor = const Color(0xFFFF3B30);
        ctaLabel = 'Update & Resubmit';
        break;
      case 'draft':
        label = 'Draft';
        description = 'You have an incomplete submission.';
        icon = Icons.edit_note_rounded;
        statusColor = const Color(0xFF007AFF);
        ctaLabel = 'Continue';
        break;
      default:
        label = 'Not Started';
        description = 'Complete KYC to unlock all features.';
        icon = Icons.info_outline_rounded;
        statusColor = theme.colorScheme.onSurface.withOpacity(0.35);
        ctaLabel = 'Begin KYC';
    }

    return GestureDetector(
      onTap: ctaLabel != null ? () => GoRouter.of(context).push('/settings/kyc') : null,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'KYC Status',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.3,
                  color: theme.colorScheme.onSurface.withOpacity(0.4),
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, size: 20, color: statusColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          label,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          description,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: theme.colorScheme.onSurface.withOpacity(0.45),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (ctaLabel != null)
                    Icon(Icons.chevron_right_rounded,
                        size: 20,
                        color: theme.colorScheme.onSurface.withOpacity(0.3)),
                ],
              ),
              if (ctaLabel != null) ...[
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 40,
                  child: ElevatedButton(
                    onPressed: () => GoRouter.of(context).push('/settings/kyc'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: statusColor == const Color(0xFFFF3B30)
                          ? statusColor
                          : const Color(0xFF077B32),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      ctaLabel,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
