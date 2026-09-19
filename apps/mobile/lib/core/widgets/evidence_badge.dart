import 'package:flutter/material.dart';
import '../models/claim.dart';
import '../theme/claimguard_theme.dart';

class EvidenceBadge extends StatelessWidget {
  final AuthenticityState state;
  final bool compact;

  const EvidenceBadge({
    super.key,
    required this.state,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    Color fg;
    Color bg;
    String label;
    IconData icon;

    switch (state) {
      case AuthenticityState.verified:
        fg = ClaimGuardTheme.riskLow;
        bg = ClaimGuardTheme.riskLowBg;
        label = 'VERIFIED';
        icon = Icons.verified_outlined;
        break;
      case AuthenticityState.likelyValid:
        fg = ClaimGuardTheme.riskLow;
        bg = ClaimGuardTheme.riskLowBg;
        label = 'LIKELY VALID';
        icon = Icons.check_circle_outline;
        break;
      case AuthenticityState.reviewRequired:
        fg = ClaimGuardTheme.riskMedium;
        bg = ClaimGuardTheme.riskMediumBg;
        label = 'REVIEW REQUIRED';
        icon = Icons.help_outline;
        break;
      case AuthenticityState.suspicious:
        fg = ClaimGuardTheme.riskHigh;
        bg = ClaimGuardTheme.riskHighBg;
        label = 'SUSPICIOUS';
        icon = Icons.warning_amber_rounded;
        break;
      case AuthenticityState.unableToVerify:
        fg = ClaimGuardTheme.slateSecondary;
        bg = ClaimGuardTheme.slateBorder.withAlpha(80);
        label = 'UNABLE TO VERIFY';
        icon = Icons.visibility_off_outlined;
        break;
    }

    if (compact) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: fg.withAlpha(80), width: 1),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: fg,
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: fg.withAlpha(100), width: 1.2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: fg),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}
