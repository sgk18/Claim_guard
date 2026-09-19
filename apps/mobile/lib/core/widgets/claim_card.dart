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

    final catColor = ClaimGuardTheme.getCategoryColor(claim.category);
    final catIcon = ClaimGuardTheme.getCategoryIcon(claim.category);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 5),
      decoration: BoxDecoration(
        color: ClaimGuardTheme.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ClaimGuardTheme.slateBorder, width: 1.0),
        boxShadow: ClaimGuardTheme.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category Avatar Icon
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: catColor.withAlpha(22),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: catColor.withAlpha(50), width: 1),
                      ),
                      child: Center(
                        child: Icon(catIcon, color: catColor, size: 22),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Merchant & Meta details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            claim.vendorName,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: ClaimGuardTheme.slateDark,
                              letterSpacing: -0.2,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Text(
                                claim.category.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: catColor,
                                ),
                              ),
                              const SizedBox(width: 6),
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
                        ],
                      ),
                    ),

                    // Amount Display
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '₹${claim.amount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: ClaimGuardTheme.slateDark,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          claim.id,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: ClaimGuardTheme.slateMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Bottom Row: Evidence Badge + Status Pill
                Container(
                  padding: const EdgeInsets.only(top: 10),
                  decoration: const BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Color(0xFFF1F5F9), width: 1.0),
                    ),
                  ),
                  child: Row(
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
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: statusColor.withAlpha(70), width: 1),
                        ),
                        child: Text(
                          claim.status.name.toUpperCase(),
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
