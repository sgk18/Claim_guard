import 'package:flutter/material.dart';
import '../models/claim.dart';
import '../theme/claimguard_theme.dart';
import 'evidence_badge.dart';

class ClaimCard extends StatelessWidget {
  final Claim claim;
  final VoidCallback onTap;

  const ClaimCard({
    super.key,
    required this.claim,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = claim.status == ClaimStatus.approved
        ? ClaimGuardTheme.riskLow
        : claim.status == ClaimStatus.rejected
            ? ClaimGuardTheme.riskHigh
            : ClaimGuardTheme.riskMedium;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      claim.vendorName,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: ClaimGuardTheme.slateDark,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${claim.currency} ${claim.amount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: ClaimGuardTheme.slateDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Text(
                    claim.id,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: ClaimGuardTheme.slateMuted,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '•  ${claim.category}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: ClaimGuardTheme.slateMuted,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '•  ${claim.claimDate}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: ClaimGuardTheme.slateMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (claim.riskAssessment != null)
                    EvidenceBadge(
                      state: claim.riskAssessment!.authenticityState,
                      compact: true,
                    )
                  else
                    const SizedBox.shrink(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withAlpha(20),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: statusColor.withAlpha(80), width: 1),
                    ),
                    child: Text(
                      claim.status.name.toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
