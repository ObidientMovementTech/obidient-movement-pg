import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/analytics_models.dart';

/// Shows a full profile bottom sheet for a person.
void showPersonProfileSheet(BuildContext context, PersonRow person) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _PersonProfileSheet(person: person),
  );
}

class _PersonProfileSheet extends StatelessWidget {
  final PersonRow person;
  const _PersonProfileSheet({required this.person});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final onSurface = theme.colorScheme.onSurface;

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
          children: [
            // Drag handle
            Center(child: Container(
              width: 36, height: 4,
              decoration: BoxDecoration(
                color: onSurface.withOpacity(0.1),
                borderRadius: BorderRadius.circular(2),
              ),
            )),
            const SizedBox(height: 20),

            // Avatar + Name
            Center(child: CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.primary.withOpacity(0.1),
              backgroundImage: person.profileImage != null && person.profileImage!.isNotEmpty
                  ? CachedNetworkImageProvider(person.profileImage!)
                  : null,
              child: person.profileImage == null || person.profileImage!.isEmpty
                  ? Text(
                      (person.name ?? '?')[0].toUpperCase(),
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.primary),
                    )
                  : null,
            )),
            const SizedBox(height: 12),
            Center(child: Text(
              person.name ?? 'Unknown',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: onSurface, letterSpacing: -0.3),
            )),
            const SizedBox(height: 8),
            // Badges
            Center(child: Wrap(
              spacing: 6,
              children: [
                if (person.designation != null)
                  _Badge(person.designation!, AppColors.primary),
                if (person.gender != null && person.gender!.isNotEmpty)
                  _Badge(person.gender!, person.gender == 'Male' ? const Color(0xFF3b82f6) : const Color(0xFFec4899)),
                if (person.ageRange != null && person.ageRange!.isNotEmpty)
                  _Badge(person.ageRange!.split(' ')[0], const Color(0xFF6b7280)),
              ],
            )),
            const SizedBox(height: 20),

            // Profile completion
            _SectionCard(
              theme: theme,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('Profile Completion', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: onSurface)),
                      const Spacer(),
                      Text('${person.profileCompletionPercentage}%', style: TextStyle(
                        fontSize: 12, fontWeight: FontWeight.w800,
                        color: person.profileCompletionPercentage == 100 ? AppColors.primary : const Color(0xFFf59e0b),
                      )),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: person.profileCompletionPercentage / 100,
                      minHeight: 6,
                      backgroundColor: onSurface.withOpacity(0.06),
                      valueColor: AlwaysStoppedAnimation(
                        person.profileCompletionPercentage == 100 ? AppColors.primary : const Color(0xFFf59e0b),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Contact
            _SectionCard(
              theme: theme,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _SectionTitle('CONTACT', theme),
                  if (person.phone != null && person.phone!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _ContactRow(icon: Icons.phone_outlined, value: person.phone!, theme: theme),
                  ],
                  if (person.email != null && person.email!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    _ContactRow(icon: Icons.email_outlined, value: person.email!, theme: theme),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Voting Info
            _SectionCard(
              theme: theme,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _SectionTitle('VOTING INFO', theme),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _InfoPair('PVC Status', person.isVoter == 'Yes' ? '✅ Has PVC' : '❌ No PVC', theme)),
                      Expanded(child: _InfoPair('Will Vote', person.willVote == 'Yes' ? '✅ Yes' : person.willVote == 'No' ? '❌ No' : '— Unknown', theme)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _InfoPair('State', person.votingState ?? '—', theme)),
                      Expanded(child: _InfoPair('LGA', person.votingLGA ?? '—', theme)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _InfoPair('Ward', person.votingWard ?? '—', theme)),
                      Expanded(child: _InfoPair('Polling Unit', person.votingPU ?? '—', theme)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Demographics
            _SectionCard(
              theme: theme,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _SectionTitle('DEMOGRAPHICS', theme),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _InfoPair('Gender', person.gender ?? '—', theme)),
                      Expanded(child: _InfoPair('Age Range', person.ageRange ?? '—', theme)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _InfoPair('State of Origin', person.stateOfOrigin ?? '—', theme)),
                      Expanded(child: _InfoPair('Citizenship', person.citizenship ?? '—', theme)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Activity
            _SectionCard(
              theme: theme,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _SectionTitle('ACTIVITY', theme),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _InfoPair('Joined', _fmtDate(person.createdAt), theme)),
                      Expanded(child: _InfoPair('Last Active', _timeAgo(person.lastActive), theme)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action buttons
            Row(
              children: [
                Expanded(child: _ActionButton(
                  icon: Icons.phone_outlined,
                  label: 'Call',
                  color: AppColors.primary,
                  onTap: () {
                    // ignore: avoid_print — handled by url_launcher in real use
                  },
                )),
                const SizedBox(width: 10),
                Expanded(child: _ActionButton(
                  icon: Icons.copy_rounded,
                  label: 'Copy Phone',
                  color: const Color(0xFF3b82f6),
                  onTap: () {
                    if (person.phone != null) {
                      Clipboard.setData(ClipboardData(text: person.phone!));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Phone copied'), duration: Duration(seconds: 1)),
                      );
                    }
                  },
                )),
                const SizedBox(width: 10),
                Expanded(child: _ActionButton(
                  icon: Icons.message_outlined,
                  label: 'WhatsApp',
                  color: const Color(0xFF25D366),
                  onTap: () {
                    // Would use url_launcher: wa.me/phone
                  },
                )),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _fmtDate(String? dateStr) {
    if (dateStr == null) return '—';
    try {
      final d = DateTime.parse(dateStr);
      final months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return '${months[d.month - 1]} ${d.day}, ${d.year}';
    } catch (_) {
      return '—';
    }
  }

  String _timeAgo(String? dateStr) {
    if (dateStr == null) return 'Never';
    try {
      final d = DateTime.parse(dateStr);
      final diff = DateTime.now().difference(d).inDays;
      if (diff == 0) return 'Today';
      if (diff == 1) return '1d ago';
      if (diff < 30) return '${diff}d ago';
      if (diff < 365) return '${(diff / 30).floor()}mo ago';
      return '${(diff / 365).floor()}y ago';
    } catch (_) {
      return 'Never';
    }
  }
}

// ── Small widgets ───────────────────────────────────────────

class _Badge extends StatelessWidget {
  final String text;
  final Color color;
  const _Badge(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(text, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final ThemeData theme;
  final Widget child;
  const _SectionCard({required this.theme, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.02),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.06)),
      ),
      child: child,
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  final ThemeData theme;
  const _SectionTitle(this.text, this.theme);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: TextStyle(
      fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8,
      color: theme.colorScheme.onSurface.withOpacity(0.35),
    ));
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String value;
  final ThemeData theme;
  const _ContactRow({required this.icon, required this.value, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: theme.colorScheme.onSurface.withOpacity(0.4)),
        const SizedBox(width: 8),
        Expanded(child: Text(value, style: TextStyle(
          fontSize: 13, fontWeight: FontWeight.w500, color: theme.colorScheme.onSurface,
        ))),
        GestureDetector(
          onTap: () {
            Clipboard.setData(ClipboardData(text: value));
            HapticFeedback.lightImpact();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Copied'), duration: Duration(seconds: 1)),
            );
          },
          child: Icon(Icons.copy_rounded, size: 14, color: theme.colorScheme.onSurface.withOpacity(0.3)),
        ),
      ],
    );
  }
}

class _InfoPair extends StatelessWidget {
  final String label;
  final String value;
  final ThemeData theme;
  const _InfoPair(this.label, this.value, this.theme);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 10, color: theme.colorScheme.onSurface.withOpacity(0.4))),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
          maxLines: 1, overflow: TextOverflow.ellipsis),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionButton({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
          ],
        ),
      ),
    );
  }
}
