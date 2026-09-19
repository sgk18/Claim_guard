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
        title: const Text('Approve Expense Claim'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Authorize reimbursement of ${_claim.currency} ${_claim.amount.toStringAsFixed(2)} to ${_claim.employeeName ?? "Employee"}.',
              style: const TextStyle(fontSize: 13, color: ClaimGuardTheme.slateMuted),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: noteController,
              decoration: const InputDecoration(
                labelText: 'Approval Note (Optional)',
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ClaimGuardTheme.riskLow,
              minimumSize: const Size(110, 42),
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final success = await widget.state.approveClaim(_claim.id, notes: noteController.text.trim());
              if (success && mounted) {
                setState(() {
                  _claim = widget.state.activeClaim ?? _claim;
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Claim approved successfully')),
                );
              }
            },
            child: const Text('Confirm Approval'),
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
        title: const Text('Reject Expense Claim'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'A mandatory reason is required to document this decision in the immutable audit log.',
              style: TextStyle(fontSize: 13, color: ClaimGuardTheme.slateMuted),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Rejection Reason *',
                hintText: 'e.g. Duplicate invoice, exceeds ceiling...',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ClaimGuardTheme.riskHigh,
              minimumSize: const Size(110, 42),
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
                  const SnackBar(content: Text('Claim rejected and audit record logged')),
                );
              }
            },
            child: const Text('Confirm Rejection'),
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

    return Scaffold(
      appBar: AppBar(
        title: Text(_claim.id),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          _claim.vendorName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: ClaimGuardTheme.slateDark,
                          ),
                        ),
                      ),
                      Text(
                        '${_claim.currency} ${_claim.amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: ClaimGuardTheme.slateDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _MetaItem(label: 'DATE', value: _claim.claimDate),
                      const SizedBox(width: 20),
                      _MetaItem(label: 'CATEGORY', value: _claim.category),
                      const SizedBox(width: 20),
                      _MetaItem(label: 'GSTIN', value: _claim.gstin ?? 'None'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1, color: ClaimGuardTheme.slateBorder),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (risk != null)
                        EvidenceBadge(state: risk.authenticityState)
                      else
                        const SizedBox.shrink(),
                      Text(
                        'STATUS: ${_claim.status.name.toUpperCase()}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: ClaimGuardTheme.slateSecondary,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Risk Assessment & Fraud Signals Card (Section 18 & 19)
            if (risk != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ClaimGuardTheme.slateBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'DETERMINISTIC RISK SCORE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: ClaimGuardTheme.slateDark,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          '${risk.score} / 100 (${risk.level.name.toUpperCase()})',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: risk.score > 60
                                ? ClaimGuardTheme.riskHigh
                                : risk.score > 30
                                    ? ClaimGuardTheme.riskMedium
                                    : ClaimGuardTheme.riskLow,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: risk.score / 100.0,
                        minHeight: 8,
                        backgroundColor: ClaimGuardTheme.slateBorder.withAlpha(80),
                        color: risk.score > 60
                            ? ClaimGuardTheme.riskHigh
                            : risk.score > 30
                                ? ClaimGuardTheme.riskMedium
                                : ClaimGuardTheme.riskLow,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // AI Bedrock Explanation (Section 20)
                    if (risk.aiNarrative != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: ClaimGuardTheme.canvasOffWhite,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: ClaimGuardTheme.slateBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.psychology_outlined, size: 16, color: ClaimGuardTheme.brandOrange),
                                SizedBox(width: 6),
                                Text(
                                  'AI Risk Narrative (Claude 3.5 Sonnet)',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: ClaimGuardTheme.slateDark,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              risk.aiNarrative!,
                              style: const TextStyle(
                                fontSize: 12,
                                height: 1.4,
                                color: ClaimGuardTheme.slateSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Triggered Signals
                    if (risk.signals.isNotEmpty) ...[
                      const Text(
                        'Triggered Verification Signals:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: ClaimGuardTheme.slateDark,
                        ),
                      ),
                      const SizedBox(height: 6),
                      ...risk.signals.map(
                        (sig) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.circle, size: 6, color: ClaimGuardTheme.riskHigh),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  '${sig.type}: ${sig.description}',
                                  style: const TextStyle(fontSize: 11, color: ClaimGuardTheme.slateSecondary),
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

            // Extracted Line Items & OCR (Section 16)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'EXTRACTED RECEIPT DETAILS',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: ClaimGuardTheme.slateDark,
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (receipt != null)
                        Text(
                          'OCR: ${(receipt.ocrConfidence * 100).toStringAsFixed(0)}% Conf.',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: ClaimGuardTheme.slateMuted,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (receipt != null && receipt.lineItems.isNotEmpty)
                    ...receipt.lineItems.map(
                      (item) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item.item,
                              style: const TextStyle(fontSize: 13, color: ClaimGuardTheme.slateDark),
                            ),
                            Text(
                              '${_claim.currency} ${item.amount.toStringAsFixed(2)}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    const Text(
                      'No itemized breakdown extracted.',
                      style: TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Manager Action Bar
            if (isManager && _claim.status != ClaimStatus.approved && _claim.status != ClaimStatus.rejected) ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ClaimGuardTheme.riskLow,
                        minimumSize: const Size(0, 48),
                      ),
                      onPressed: _showApprovalDialog,
                      child: const Text('Approve Claim'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: ClaimGuardTheme.riskHigh,
                        side: const BorderSide(color: ClaimGuardTheme.riskHigh),
                        minimumSize: const Size(0, 48),
                      ),
                      onPressed: _showRejectionDialog,
                      child: const Text('Reject Claim'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ],
        ),
      ),
    );
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
            fontWeight: FontWeight.w700,
            color: ClaimGuardTheme.slateMuted,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: ClaimGuardTheme.slateDark,
          ),
        ),
      ],
    );
  }
}
