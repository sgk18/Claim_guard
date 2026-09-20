import 'package:flutter/material.dart';
import '../../core/models/claim.dart';
import '../../core/models/session.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';
import '../../core/widgets/evidence_badge.dart';

class ClaimDetailScreen extends StatefulWidget {
  final Claim claim;
  final AppState state;

  const ClaimDetailScreen({
    super.key,
    required this.claim,
    required this.state,
  });

  @override
  State<ClaimDetailScreen> createState() => _ClaimDetailScreenState();
}

class _ClaimDetailScreenState extends State<ClaimDetailScreen> {
  late Claim _claim;

  @override
  void initState() {
    super.initState();
    _claim = widget.claim;
  }

  void _showApprovalDialog() {
    final noteController = TextEditingController(text: 'Verified and approved under company expense policy.');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle_rounded, color: ClaimGuardTheme.riskLow, size: 22),
            SizedBox(width: 8),
            Text(
              'Approve Expense Claim',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Authorize reimbursement of ${_claim.currency} ${_claim.amount.toStringAsFixed(2)} to ${_claim.employeeName ?? "Employee"}.',
              style: const TextStyle(fontSize: 13, color: ClaimGuardTheme.slateSecondary, height: 1.4),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: noteController,
              decoration: const InputDecoration(
                labelText: 'Approval Note (Optional)',
                hintText: 'Add note for audit log...',
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: ClaimGuardTheme.slateSecondary, fontWeight: FontWeight.w700)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ClaimGuardTheme.riskLow,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final success = await widget.state.approveClaim(_claim.id, notes: noteController.text.trim());
              if (success && mounted) {
                setState(() {
                  _claim = widget.state.activeClaim ?? _claim;
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Claim approved successfully'),
                    backgroundColor: ClaimGuardTheme.slateDark,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            child: const Text('Confirm Approval', style: TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  void _showRejectionDialog() {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.flag_rounded, color: ClaimGuardTheme.riskHigh, size: 22),
            SizedBox(width: 8),
            Text(
              'Reject Expense Claim',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'A mandatory reason is required to document this decision in the immutable audit log.',
              style: TextStyle(fontSize: 13, color: ClaimGuardTheme.slateSecondary, height: 1.4),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Rejection Reason *',
                hintText: 'e.g. Duplicate receipt, exceeds policy limit...',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: ClaimGuardTheme.slateSecondary, fontWeight: FontWeight.w700)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ClaimGuardTheme.riskHigh,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              final reason = reasonController.text.trim();
              if (reason.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Rejection reason cannot be empty')),
                );
                return;
              }
              Navigator.of(ctx).pop();
              final success = await widget.state.rejectClaim(_claim.id, reason: reason);
              if (success && mounted) {
                setState(() {
                  _claim = widget.state.activeClaim ?? _claim;
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Claim rejected and audit record logged'),
                    backgroundColor: ClaimGuardTheme.slateDark,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            child: const Text('Confirm Rejection', style: TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isManager = widget.state.currentRole == Role.manager;
    final risk = _claim.riskAssessment;
    final receipt = _claim.receipt;
    final categoryIcon = ClaimGuardTheme.getCategoryIcon(_claim.category);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _claim.id,
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: -0.3),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.canvasOffWhite,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: ClaimGuardTheme.slateBorder),
                ),
                child: Text(
                  _claim.category.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: ClaimGuardTheme.slateSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Receipt Header Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
                boxShadow: ClaimGuardTheme.subtleShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: ClaimGuardTheme.brandOrange.withAlpha(22),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ClaimGuardTheme.brandOrange.withAlpha(45)),
                        ),
                        child: Icon(categoryIcon, color: ClaimGuardTheme.brandOrange, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _claim.vendorName,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: ClaimGuardTheme.slateDark,
                                letterSpacing: -0.4,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Submitted by ${_claim.employeeName ?? "Employee"}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: ClaimGuardTheme.slateMuted,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '${_claim.currency} ${_claim.amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: ClaimGuardTheme.slateDark,
                          letterSpacing: -0.6,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: ClaimGuardTheme.canvasOffWhite,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _MetaItem(label: 'DATE', value: _claim.claimDate),
                        Container(width: 1, height: 26, color: ClaimGuardTheme.slateBorder),
                        _MetaItem(label: 'CATEGORY', value: _claim.category),
                        Container(width: 1, height: 26, color: ClaimGuardTheme.slateBorder),
                        _MetaItem(label: 'GSTIN', value: _claim.gstin ?? 'Not Provided'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (risk != null)
                        EvidenceBadge(state: risk.authenticityState)
                      else
                        const SizedBox.shrink(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getStatusBgColor(_claim.status),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: _getStatusBorderColor(_claim.status)),
                        ),
                        child: Text(
                          _claim.status.name.toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: _getStatusTextColor(_claim.status),
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Risk Assessment & Fraud Signals Card
            if (risk != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.surfaceWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: risk.score > 60
                        ? ClaimGuardTheme.riskHigh.withAlpha(80)
                        : ClaimGuardTheme.slateBorder,
                  ),
                  boxShadow: ClaimGuardTheme.subtleShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.shield_outlined, size: 16, color: ClaimGuardTheme.slateDark),
                            SizedBox(width: 6),
                            Text(
                              'INTEGRITY & RISK SCORE',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: ClaimGuardTheme.slateDark,
                                letterSpacing: 0.6,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: _getRiskBgColor(risk.score),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: _getRiskColor(risk.score).withAlpha(90)),
                          ),
                          child: Text(
                            '${risk.score}/100 • ${risk.level.name.toUpperCase()}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: _getRiskColor(risk.score),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: risk.score / 100.0,
                        minHeight: 10,
                        backgroundColor: ClaimGuardTheme.slateBorder.withAlpha(80),
                        color: _getRiskColor(risk.score),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // AI Bedrock / Claude 3.5 Sonnet Narrative
                    if (risk.aiNarrative != null) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: ClaimGuardTheme.canvasOffWhite,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ClaimGuardTheme.brandOrange.withAlpha(60)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: ClaimGuardTheme.brandOrange.withAlpha(30),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Icon(Icons.psychology_rounded, size: 16, color: ClaimGuardTheme.brandOrange),
                                ),
                                const SizedBox(width: 8),
                                const Text(
                                  'AI Narrative (Claude 3.5 Sonnet)',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    color: ClaimGuardTheme.slateDark,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              risk.aiNarrative!,
                              style: const TextStyle(
                                fontSize: 12,
                                height: 1.5,
                                color: ClaimGuardTheme.slateSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Triggered Signals
                    if (risk.signals.isNotEmpty) ...[
                      const Text(
                        'Triggered Integrity Signals',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: ClaimGuardTheme.slateDark,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...risk.signals.map(
                        (sig) => Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: ClaimGuardTheme.canvasOffWhite,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: ClaimGuardTheme.slateBorder),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(top: 4.0),
                                child: Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: ClaimGuardTheme.riskHigh,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: RichText(
                                  text: TextSpan(
                                    style: const TextStyle(fontSize: 11, color: ClaimGuardTheme.slateSecondary, height: 1.4),
                                    children: [
                                      TextSpan(
                                        text: '${sig.type}: ',
                                        style: const TextStyle(fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                                      ),
                                      TextSpan(text: sig.description),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Extracted Line Items & OCR Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
                boxShadow: ClaimGuardTheme.subtleShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.receipt_rounded, size: 16, color: ClaimGuardTheme.slateDark),
                          SizedBox(width: 6),
                          Text(
                            'EXTRACTED RECEIPT DETAILS',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: ClaimGuardTheme.slateDark,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ],
                      ),
                      if (receipt != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: ClaimGuardTheme.canvasOffWhite,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: ClaimGuardTheme.slateBorder),
                          ),
                          child: Text(
                            'OCR ${(receipt.ocrConfidence * 100).toStringAsFixed(0)}% Conf.',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: ClaimGuardTheme.slateSecondary,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  if (receipt != null && receipt.lineItems.isNotEmpty) ...[
                    ...receipt.lineItems.asMap().entries.map(
                      (entry) {
                        final idx = entry.key;
                        final item = entry.value;
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: idx % 2 == 0 ? Colors.transparent : ClaimGuardTheme.canvasOffWhite.withAlpha(120),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  item.item,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: ClaimGuardTheme.slateDark),
                                ),
                              ),
                              Text(
                                '${_claim.currency} ${item.amount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: ClaimGuardTheme.slateDark,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1, color: ClaimGuardTheme.slateBorder),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Authorized',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                        ),
                        Text(
                          '${_claim.currency} ${_claim.amount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: ClaimGuardTheme.brandOrange,
                          ),
                        ),
                      ],
                    ),
                  ] else
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(
                        'No itemized breakdown extracted for this receipt.',
                        style: TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Manager Decision Action Bar
            if (isManager && _claim.status != ClaimStatus.approved && _claim.status != ClaimStatus.rejected) ...[
              Row(
                children: [
                  Expanded(
                    flex: 6,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ClaimGuardTheme.riskLow,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(0, 50),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.check_circle_rounded, size: 18),
                      label: const Text(
                        'Approve Reimbursement',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                      ),
                      onPressed: _showApprovalDialog,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 4,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: ClaimGuardTheme.riskHigh,
                        side: const BorderSide(color: ClaimGuardTheme.riskHigh, width: 1.5),
                        minimumSize: const Size(0, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.flag_rounded, size: 18),
                      label: const Text(
                        'Reject',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                      ),
                      onPressed: _showRejectionDialog,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ],
        ),
      ),
    );
  }

  Color _getRiskColor(int score) {
    if (score > 60) return ClaimGuardTheme.riskHigh;
    if (score > 30) return ClaimGuardTheme.riskMedium;
    return ClaimGuardTheme.riskLow;
  }

  Color _getRiskBgColor(int score) {
    if (score > 60) return ClaimGuardTheme.riskHigh.withAlpha(25);
    if (score > 30) return ClaimGuardTheme.riskMedium.withAlpha(25);
    return ClaimGuardTheme.riskLow.withAlpha(25);
  }

  Color _getStatusBgColor(ClaimStatus status) {
    switch (status) {
      case ClaimStatus.approved:
        return ClaimGuardTheme.riskLow.withAlpha(25);
      case ClaimStatus.rejected:
        return ClaimGuardTheme.riskHigh.withAlpha(25);
      case ClaimStatus.reviewRequired:
        return ClaimGuardTheme.riskMedium.withAlpha(25);
      default:
        return ClaimGuardTheme.canvasOffWhite;
    }
  }

  Color _getStatusBorderColor(ClaimStatus status) {
    switch (status) {
      case ClaimStatus.approved:
        return ClaimGuardTheme.riskLow.withAlpha(90);
      case ClaimStatus.rejected:
        return ClaimGuardTheme.riskHigh.withAlpha(90);
      case ClaimStatus.reviewRequired:
        return ClaimGuardTheme.riskMedium.withAlpha(90);
      default:
        return ClaimGuardTheme.slateBorder;
    }
  }

  Color _getStatusTextColor(ClaimStatus status) {
    switch (status) {
      case ClaimStatus.approved:
        return ClaimGuardTheme.riskLow;
      case ClaimStatus.rejected:
        return ClaimGuardTheme.riskHigh;
      case ClaimStatus.reviewRequired:
        return ClaimGuardTheme.riskMedium;
      default:
        return ClaimGuardTheme.slateSecondary;
    }
  }
}

class _MetaItem extends StatelessWidget {
  final String label;
  final String value;

  const _MetaItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w800,
            color: ClaimGuardTheme.slateMuted,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: ClaimGuardTheme.slateDark,
          ),
        ),
      ],
    );
  }
}
