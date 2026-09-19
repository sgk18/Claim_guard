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
    Color border;
    String label;
    IconData icon;

    switch (state) {
      case AuthenticityState.verified:
        fg = ClaimGuardTheme.riskLow;
        bg = ClaimGuardTheme.riskLowBg;
        border = ClaimGuardTheme.riskLowBorder;
        label = 'VERIFIED';
        icon = Icons.verified_rounded;
        break;
      case AuthenticityState.likelyValid:
        fg = ClaimGuardTheme.infoBlue;
        bg = ClaimGuardTheme.infoBlueBg;
        border = ClaimGuardTheme.infoBlueBorder;
        label = 'LIKELY VALID';
        icon = Icons.check_circle_rounded;
        break;
      case AuthenticityState.reviewRequired:
        fg = ClaimGuardTheme.riskMedium;
        bg = ClaimGuardTheme.riskMediumBg;
        border = ClaimGuardTheme.riskMediumBorder;
        label = 'REVIEW REQUIRED';
        icon = Icons.error_outline_rounded;
        break;
      case AuthenticityState.suspicious:
        fg = ClaimGuardTheme.riskHigh;
        bg = ClaimGuardTheme.riskHighBg;
        border = ClaimGuardTheme.riskHighBorder;
        label = 'SUSPICIOUS';
        icon = Icons.warning_amber_rounded;
        break;
      case AuthenticityState.unableToVerify:
        fg = ClaimGuardTheme.slateMuted;
        bg = ClaimGuardTheme.canvasOffWhite;
        border = ClaimGuardTheme.slateBorder;
        label = 'UNABLE TO VERIFY';
        icon = Icons.help_outline_rounded;
        break;
    }

    if (compact) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: border, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 10, color: fg),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: fg,
                fontSize: 9.5,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border, width: 1.2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: fg),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}
