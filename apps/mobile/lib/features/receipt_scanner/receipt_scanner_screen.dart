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

    // Populate according to sample type
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

    // Call Fastify analyze API
    try {
      await widget.state.api.analyzeReceipt(
        [0xFF, 0xD8, 0xFF, 0xE0], // JPEG magic bytes
        _sampleFileName,
      );
    } catch (_) {}

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _step = 2; // Show extracted review sheet
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
        title: const Text('Receipt Scanner'),
      ),
      body: SafeArea(
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_step == 1) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: ClaimGuardTheme.brandOrange),
            SizedBox(height: 20),
            Text(
              'Analyzing Receipt Image...',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
            ),
            SizedBox(height: 6),
            Text(
              'Running AWS Textract OCR, GSTIN validation & duplicate check',
              style: TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
            ),
          ],
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
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: ClaimGuardTheme.riskLow.withAlpha(80)),
              ),
              child: Row(
                children: [
                  const EvidenceBadge(state: AuthenticityState.verified),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'OCR Confidence: ${(_ocrConfidence * 100).toStringAsFixed(0)}% • Compliant with company policy',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: ClaimGuardTheme.riskLow),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            const Text(
              'Verify Extracted Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
            ),
            const SizedBox(height: 4),
            const Text(
              'Confirm merchant, date, and line item amounts before final submission.',
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
                    decoration: const InputDecoration(labelText: 'Invoice Date'),
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

            const SizedBox(height: 20),
            // Itemized Breakdown Table
            const Text(
              'Extracted Line Items',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
              ),
              child: Column(
                children: _lineItems.map((item) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(item.item, style: const TextStyle(fontSize: 12, color: ClaimGuardTheme.slateDark)),
                        Text('INR ${item.amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 28),
            ElevatedButton(
              onPressed: widget.state.isLoading ? null : _confirmAndSubmit,
              child: widget.state.isLoading
                  ? const CircularProgressIndicator(color: ClaimGuardTheme.surfaceWhite)
                  : const Text('Confirm & Submit to Queue'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => setState(() => _step = 0),
              child: const Text('Discard & Retake'),
            ),
          ],
        ),
      );
    }

    if (_step == 3) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: ClaimGuardTheme.riskLowBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: ClaimGuardTheme.riskLow, size: 36),
              ),
              const SizedBox(height: 20),
              const Text(
                'Claim Submitted',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
              ),
              const SizedBox(height: 6),
              const Text(
                'Your expense receipt has been submitted and queued for manager review.',
                style: TextStyle(fontSize: 13, color: ClaimGuardTheme.slateMuted),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              ElevatedButton(
                onPressed: () => setState(() => _step = 0),
                child: const Text('Scan Another Receipt'),
              ),
            ],
          ),
        ),
      );
    }

    // Step 0: Capture Screen / Sample Picker
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Camera Viewfinder Mock / Frame
          Container(
            width: double.infinity,
            height: 280,
            decoration: BoxDecoration(
              color: ClaimGuardTheme.slateDark,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ClaimGuardTheme.slateSecondary, width: 2),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
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
                      child: const Icon(Icons.camera_alt, color: ClaimGuardTheme.surfaceWhite, size: 32),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Position Receipt Inside Frame',
                      style: TextStyle(color: ClaimGuardTheme.surfaceWhite, fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Ensure merchant name, date, and total are legible',
                      style: TextStyle(color: ClaimGuardTheme.slateBorder, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text(
            'Select Sample Invoice to Test OCR:',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
          ),
          const SizedBox(height: 12),

          // 3 Quick Sample Invoices
          _SampleInvoiceTile(
            title: 'Fuel Station Invoice (INR 3,850)',
            subtitle: 'Indian Oil Corp Ltd • Verified GSTIN',
            icon: Icons.local_gas_station_outlined,
            onTap: () => _simulateCapture('fuel'),
          ),
          const SizedBox(height: 8),
          _SampleInvoiceTile(
            title: 'Client Dining Bill (INR 1,240)',
            subtitle: 'Haldirams Pune • Itemized Thali',
            icon: Icons.restaurant_outlined,
            onTap: () => _simulateCapture('meal'),
          ),
          const SizedBox(height: 8),
          _SampleInvoiceTile(
            title: 'Field Hotel Lodging (INR 7,499)',
            subtitle: 'The Taj Gateway Hotel • GSTIN',
            icon: Icons.hotel_outlined,
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
  final IconData icon;
  final VoidCallback onTap;

  const _SampleInvoiceTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: ClaimGuardTheme.surfaceWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: ClaimGuardTheme.slateBorder),
        ),
        child: Row(
          children: [
            Icon(icon, color: ClaimGuardTheme.brandOrange, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: ClaimGuardTheme.slateMuted),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 12, color: ClaimGuardTheme.slateMuted),
          ],
        ),
      ),
    );
  }
}
