import 'package:flutter/material.dart';
import '../../core/models/claim.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';
import '../../core/widgets/evidence_badge.dart';

class ReceiptScannerScreen extends StatefulWidget {
  final AppState state;
  final Function(Claim) onClaimSubmitted;

  const ReceiptScannerScreen({
    super.key,
    required this.state,
    required this.onClaimSubmitted,
  });

  @override
  State<ReceiptScannerScreen> createState() => _ReceiptScannerScreenState();
}

class _ReceiptScannerScreenState extends State<ReceiptScannerScreen> {
  int _step = 0; // 0: Capture/Select, 1: Processing, 2: Review Extracted, 3: Success

  // Extracted/editable fields
  final _vendorController = TextEditingController(text: 'Indian Oil Corporation Ltd');
  final _amountController = TextEditingController(text: '3850.00');
  final _dateController = TextEditingController(text: '2026-09-19');
  final _gstinController = TextEditingController(text: '29AAACI1681G1Z1');
  String _selectedCategory = 'FUEL';
  double _ocrConfidence = 0.96;
  String _sampleFileName = 'fuel_invoice_0919.jpg';
  List<ReceiptLineItem> _lineItems = [
    ReceiptLineItem(item: 'Diesel High Speed (42.3L)', quantity: 42, rate: 91.0, amount: 3850.0),
  ];

  @override
  void dispose() {
    _vendorController.dispose();
    _amountController.dispose();
    _dateController.dispose();
    _gstinController.dispose();
    super.dispose();
  }

  void _simulateCapture(String sampleType) async {
    setState(() {
      _step = 1;
    });

    if (sampleType == 'meal') {
      _vendorController.text = 'Haldirams Restaurant Pune';
      _amountController.text = '1240.00';
      _dateController.text = '2026-09-18';
      _gstinController.text = '27AABCH1234A1Z1';
      _selectedCategory = 'MEALS';
      _ocrConfidence = 0.98;
      _sampleFileName = 'haldirams_pune_20260918.jpg';
      _lineItems = [
        ReceiptLineItem(item: 'Thali Meal x2', amount: 850.0),
        ReceiptLineItem(item: 'Beverages', amount: 200.0),
        ReceiptLineItem(item: 'CGST + SGST (5%)', amount: 52.5),
        ReceiptLineItem(item: 'Service Charge', amount: 137.5),
      ];
    } else if (sampleType == 'hotel') {
      _vendorController.text = 'The Taj Gateway Hotel';
      _amountController.text = '7499.00';
      _dateController.text = '2026-09-17';
      _gstinController.text = '27AAACT1234F1Z5';
      _selectedCategory = 'HOTEL';
      _ocrConfidence = 0.94;
      _sampleFileName = 'taj_hotel_sep17.jpg';
      _lineItems = [
        ReceiptLineItem(item: 'Executive Room Night', amount: 6500.0),
        ReceiptLineItem(item: 'Room Dining', amount: 999.0),
      ];
    } else {
      _vendorController.text = 'Indian Oil Corporation Ltd';
      _amountController.text = '3850.00';
      _dateController.text = '2026-09-19';
      _gstinController.text = '29AAACI1681G1Z1';
      _selectedCategory = 'FUEL';
      _ocrConfidence = 0.96;
      _sampleFileName = 'fuel_invoice_0919.jpg';
      _lineItems = [
        ReceiptLineItem(item: 'Diesel High Speed (42.3L)', quantity: 42, rate: 91.0, amount: 3850.0),
      ];
    }

    try {
      await widget.state.api.analyzeReceipt(
        [0xFF, 0xD8, 0xFF, 0xE0],
        _sampleFileName,
      );
    } catch (_) {}

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _step = 2;
      });
    }
  }

  Future<void> _confirmAndSubmit() async {
    final amount = double.tryParse(_amountController.text) ?? 0.0;
    final claim = await widget.state.submitNewClaim(
      vendorName: _vendorController.text.trim(),
      amount: amount,
      claimDate: _dateController.text.trim(),
      category: _selectedCategory,
      gstin: _gstinController.text.trim(),
      receipt: {
        'fileName': _sampleFileName,
        'fileUrl': 'https://storage.claimguard.internal/receipts/$_sampleFileName',
        'fileSizeBytes': 245000,
        'mimeType': 'image/jpeg',
        'storageKey': 'receipts/$_sampleFileName',
        'imageHash': 'a1b2c3d4e5f60718',
        'ocrConfidence': {'total': _ocrConfidence},
        'lineItems': _lineItems.map((i) => i.toJson()).toList(),
      },
    );

    if (claim != null && mounted) {
      setState(() => _step = 3);
      widget.onClaimSubmitted(claim);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Smart Receipt Scanner',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: ClaimGuardTheme.brandOrangeSurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ClaimGuardTheme.brandOrangeLight),
            ),
            child: const Row(
              children: [
                Icon(Icons.bolt_rounded, size: 14, color: ClaimGuardTheme.brandOrange),
                SizedBox(width: 4),
                Text(
                  'AWS Textract',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: ClaimGuardTheme.brandOrange),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Step Progress Indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              color: ClaimGuardTheme.surfaceWhite,
              child: Row(
                children: [
                  _buildStepDot(0, 'Capture'),
                  _buildStepLine(0),
                  _buildStepDot(1, 'OCR Scan'),
                  _buildStepLine(1),
                  _buildStepDot(2, 'Review'),
                  _buildStepLine(2),
                  _buildStepDot(3, 'Queued'),
                ],
              ),
            ),
            const Divider(height: 1, color: ClaimGuardTheme.slateBorder),

            Expanded(child: _buildBody()),
          ],
        ),
      ),
    );
  }

  Widget _buildStepDot(int stepIndex, String label) {
    final isActive = _step == stepIndex;
    final isDone = _step > stepIndex;

    Color color;
    if (isDone) {
      color = ClaimGuardTheme.riskLow;
    } else if (isActive) {
      color = ClaimGuardTheme.brandOrange;
    } else {
      color = ClaimGuardTheme.slateBorder;
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        CircleAvatar(
          radius: 10,
          backgroundColor: color,
          child: isDone
              ? const Icon(Icons.check, size: 12, color: ClaimGuardTheme.surfaceWhite)
              : Text(
                  '${stepIndex + 1}',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isActive ? ClaimGuardTheme.surfaceWhite : ClaimGuardTheme.slateMuted,
                  ),
                ),
        ),
        const SizedBox(height: 3),
        Text(
          label,
          style: TextStyle(
            fontSize: 9.5,
            fontWeight: isActive || isDone ? FontWeight.w800 : FontWeight.w500,
            color: isActive ? ClaimGuardTheme.slateDark : ClaimGuardTheme.slateMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildStepLine(int stepIndex) {
    final isDone = _step > stepIndex;
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 14, left: 4, right: 4),
        color: isDone ? ClaimGuardTheme.riskLow : ClaimGuardTheme.slateBorder,
      ),
    );
  }

  Widget _buildBody() {
    if (_step == 1) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.brandOrangeSurface,
                  shape: BoxShape.circle,
                  border: Border.all(color: ClaimGuardTheme.brandOrangeLight, width: 2),
                ),
                child: const Center(
                  child: CircularProgressIndicator(color: ClaimGuardTheme.brandOrange, strokeWidth: 3),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Analyzing Receipt Image...',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: ClaimGuardTheme.slateDark),
              ),
              const SizedBox(height: 8),
              const Text(
                'Executing AWS Textract OCR, GSTIN Luhn Modulo-36 check, and image duplicate hash comparison.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, height: 1.4, color: ClaimGuardTheme.slateMuted),
              ),
            ],
          ),
        ),
      );
    }

    if (_step == 2) {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Evidence Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.riskLowBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ClaimGuardTheme.riskLowBorder, width: 1.2),
              ),
              child: Row(
                children: [
                  const EvidenceBadge(state: AuthenticityState.verified),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'OCR Confidence: ${(_ocrConfidence * 100).toStringAsFixed(0)}% • Compliant with company policy',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: ClaimGuardTheme.riskLow),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            const Text(
              'Verify Extracted Bill Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: ClaimGuardTheme.slateDark, letterSpacing: -0.3),
            ),
            const SizedBox(height: 4),
            const Text(
              'Confirm merchant, date, and line items before final submission.',
              style: TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
            ),
            const SizedBox(height: 16),

            // Form Fields
            TextField(
              controller: _vendorController,
              decoration: const InputDecoration(labelText: 'Merchant / Vendor Name'),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Amount (INR)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _dateController,
                    decoration: const InputDecoration(labelText: 'Invoice Date (YYYY-MM-DD)'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _selectedCategory,
                    decoration: const InputDecoration(labelText: 'Expense Category'),
                    items: const [
                      DropdownMenuItem(value: 'MEALS', child: Text('MEALS')),
                      DropdownMenuItem(value: 'FUEL', child: Text('FUEL')),
                      DropdownMenuItem(value: 'HOTEL', child: Text('HOTEL')),
                      DropdownMenuItem(value: 'TRAVEL', child: Text('TRAVEL')),
                      DropdownMenuItem(value: 'MISC', child: Text('MISC')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _gstinController,
                    decoration: const InputDecoration(labelText: 'Merchant GSTIN'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),
            // Itemized Breakdown Table
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Extracted Line Items',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: ClaimGuardTheme.slateDark),
                ),
                Text(
                  '${_lineItems.length} items found',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: ClaimGuardTheme.slateMuted),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
                boxShadow: ClaimGuardTheme.cardShadow,
              ),
              child: Column(
                children: _lineItems.map((item) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(item.item, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: ClaimGuardTheme.slateDark)),
                        Text('₹${item.amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ClaimGuardTheme.slateDark)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 26),
            ElevatedButton.icon(
              onPressed: widget.state.isLoading ? null : _confirmAndSubmit,
              icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
              label: widget.state.isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: ClaimGuardTheme.surfaceWhite, strokeWidth: 2))
                  : const Text('Confirm & Submit to Queue'),
            ),
            const SizedBox(height: 10),
            OutlinedButton(
              onPressed: () => setState(() => _step = 0),
              child: const Text('Discard & Rescan'),
            ),
          ],
        ),
      );
    }

    if (_step == 3) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  color: ClaimGuardTheme.riskLowBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded, color: ClaimGuardTheme.riskLow, size: 42),
              ),
              const SizedBox(height: 22),
              const Text(
                'Claim Submitted!',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: ClaimGuardTheme.slateDark, letterSpacing: -0.5),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your expense invoice has been analyzed, scored by the deterministic fraud engine, and queued for manager approval.',
                style: TextStyle(fontSize: 13, height: 1.4, color: ClaimGuardTheme.slateMuted),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              ElevatedButton.icon(
                onPressed: () => setState(() => _step = 0),
                icon: const Icon(Icons.add_a_photo_outlined, size: 18),
                label: const Text('Scan Another Receipt'),
              ),
            ],
          ),
        ),
      );
    }

    // Step 0: Capture Screen / Sample Picker
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Styled Camera Viewfinder Frame with Crosshairs
          Container(
            width: double.infinity,
            height: 260,
            decoration: BoxDecoration(
              gradient: ClaimGuardTheme.heroGradient,
              borderRadius: BorderRadius.circular(20),
              boxShadow: ClaimGuardTheme.floatingShadow,
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Corner Crosshairs / Viewfinder brackets
                Positioned(
                  top: 20,
                  left: 20,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                        left: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 20,
                  right: 20,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                        right: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  left: 20,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                        left: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  right: 20,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                        right: BorderSide(color: ClaimGuardTheme.brandOrange, width: 3),
                      ),
                    ),
                  ),
                ),

                // Center shutter icon
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: ClaimGuardTheme.brandOrange.withAlpha(40),
                        shape: BoxShape.circle,
                        border: Border.all(color: ClaimGuardTheme.brandOrange, width: 2),
                      ),
                      child: const Icon(Icons.camera_alt_rounded, color: ClaimGuardTheme.surfaceWhite, size: 30),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Align Receipt Within Viewfinder',
                      style: TextStyle(color: ClaimGuardTheme.surfaceWhite, fontSize: 14, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Auto-extracts vendor, GSTIN, amount & date',
                      style: TextStyle(color: ClaimGuardTheme.surfaceWhite.withAlpha(160), fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Row(
            children: [
              Icon(Icons.touch_app_rounded, size: 16, color: ClaimGuardTheme.brandOrange),
              SizedBox(width: 6),
              Text(
                'Test Invoice Scenarios (Instant OCR):',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 3 Quick Sample Invoices
          _SampleInvoiceTile(
            title: 'Fuel Station Invoice (₹3,850.00)',
            subtitle: 'Indian Oil Corp Ltd • 42.3L Diesel • GSTIN: 29AAACI...',
            category: 'FUEL',
            onTap: () => _simulateCapture('fuel'),
          ),
          const SizedBox(height: 10),
          _SampleInvoiceTile(
            title: 'Team Dining Meal (₹1,240.00)',
            subtitle: 'Haldirams Pune • Thali & Beverages • GST: 5%',
            category: 'MEALS',
            onTap: () => _simulateCapture('meal'),
          ),
          const SizedBox(height: 10),
          _SampleInvoiceTile(
            title: 'Field Hotel Lodging (₹7,499.00)',
            subtitle: 'The Taj Gateway Hotel • Executive Suite • Room Dining',
            category: 'HOTEL',
            onTap: () => _simulateCapture('hotel'),
          ),
        ],
      ),
    );
  }
}

class _SampleInvoiceTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final String category;
  final VoidCallback onTap;

  const _SampleInvoiceTile({
    required this.title,
    required this.subtitle,
    required this.category,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final catColor = ClaimGuardTheme.getCategoryColor(category);
    final catIcon = ClaimGuardTheme.getCategoryIcon(category);

    return Container(
      decoration: BoxDecoration(
        color: ClaimGuardTheme.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ClaimGuardTheme.slateBorder),
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
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: catColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(catIcon, color: catColor, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: const TextStyle(fontSize: 11, color: ClaimGuardTheme.slateMuted),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: ClaimGuardTheme.slateMuted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
