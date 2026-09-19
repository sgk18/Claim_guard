enum ClaimStatus { draft, pending, approved, rejected, clarificationRequested, reviewRequired }

enum RiskLevel { low, medium, high, critical }

enum AuthenticityState { verified, likelyValid, reviewRequired, suspicious, unableToVerify }

class ReceiptLineItem {
  final String item;
  final int? quantity;
  final double? rate;
  final double amount;

  ReceiptLineItem({
    required this.item,
    this.quantity,
    this.rate,
    required this.amount,
  });

  factory ReceiptLineItem.fromJson(Map<String, dynamic> json) {
    return ReceiptLineItem(
      item: json['item'] ?? json['description'] ?? 'Item',
      quantity: json['quantity'] != null ? (json['quantity'] as num).toInt() : null,
      rate: json['rate'] != null ? (json['rate'] as num).toDouble() : null,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'item': item,
    'quantity': quantity,
    'rate': rate,
    'amount': amount,
  };
}

class Receipt {
  final String id;
  final String fileName;
  final String fileUrl;
  final String? imageHash;
  final String? perceptualHash;
  final String? rawOcrText;
  final double ocrConfidence;
  final List<ReceiptLineItem> lineItems;

  Receipt({
    required this.id,
    required this.fileName,
    required this.fileUrl,
    this.imageHash,
    this.perceptualHash,
    this.rawOcrText,
    this.ocrConfidence = 0.95,
    this.lineItems = const [],
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    final rawItems = json['lineItems'] as List<dynamic>? ?? [];
    return Receipt(
      id: json['id'] ?? '',
      fileName: json['fileName'] ?? 'receipt.jpg',
      fileUrl: json['fileUrl'] ?? '',
      imageHash: json['imageHash'] ?? json['perceptualHash'],
      perceptualHash: json['perceptualHash'] ?? json['imageHash'],
      rawOcrText: json['rawOcrText'],
      ocrConfidence: (json['ocrConfidence'] is num) ? (json['ocrConfidence'] as num).toDouble() : 0.95,
      lineItems: rawItems.map((i) => ReceiptLineItem.fromJson(i as Map<String, dynamic>)).toList(),
    );
  }
}

class FraudSignal {
  final String id;
  final String type;
  final String severity;
  final int scoreImpact;
  final String description;
  final String? matchedClaimId;

  FraudSignal({
    required this.id,
    required this.type,
    required this.severity,
    required this.scoreImpact,
    required this.description,
    this.matchedClaimId,
  });

  factory FraudSignal.fromJson(Map<String, dynamic> json) {
    return FraudSignal(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      severity: json['severity'] ?? 'LOW',
      scoreImpact: (json['scoreImpact'] as num?)?.toInt() ?? 0,
      description: json['description'] ?? '',
      matchedClaimId: json['matchedClaimId'],
    );
  }
}

class RiskAssessment {
  final String id;
  final int score;
  final RiskLevel level;
  final AuthenticityState authenticityState;
  final String recommendedAction;
  final String summary;
  final String? aiNarrative;
  final List<FraudSignal> signals;
  final List<String> rulesTriggered;

  RiskAssessment({
    required this.id,
    required this.score,
    required this.level,
    required this.authenticityState,
    required this.recommendedAction,
    required this.summary,
    this.aiNarrative,
    this.signals = const [],
    this.rulesTriggered = const [],
  });

  factory RiskAssessment.fromJson(Map<String, dynamic> json) {
    final score = (json['score'] as num?)?.toInt() ?? 0;
    
    // Level
    final levelStr = (json['level'] ?? 'LOW').toString().toUpperCase();
    final level = levelStr == 'CRITICAL'
        ? RiskLevel.critical
        : levelStr == 'HIGH'
            ? RiskLevel.high
            : levelStr == 'MEDIUM'
                ? RiskLevel.medium
                : RiskLevel.low;

    // Authenticity State
    final authStr = (json['authenticityState'] ?? 'REVIEW REQUIRED').toString().toUpperCase();
    AuthenticityState authState;
    if (authStr == 'VERIFIED') {
      authState = AuthenticityState.verified;
    } else if (authStr == 'LIKELY VALID') {
      authState = AuthenticityState.likelyValid;
    } else if (authStr == 'SUSPICIOUS') {
      authState = AuthenticityState.suspicious;
    } else if (authStr == 'UNABLE TO VERIFY') {
      authState = AuthenticityState.unableToVerify;
    } else {
      authState = AuthenticityState.reviewRequired;
    }

    final rawSignals = json['signals'] as List<dynamic>? ?? [];
    final rawRules = json['rulesTriggered'] as List<dynamic>? ?? [];

    return RiskAssessment(
      id: json['id'] ?? '',
      score: score,
      level: level,
      authenticityState: authState,
      recommendedAction: json['recommendedAction'] ?? 'REVIEW',
      summary: json['summary'] ?? '',
      aiNarrative: json['aiNarrative'],
      signals: rawSignals.map((s) => FraudSignal.fromJson(s as Map<String, dynamic>)).toList(),
      rulesTriggered: rawRules.map((r) => r.toString()).toList(),
    );
  }
}

class Claim {
  final String id;
  final String? organizationId;
  final String employeeId;
  final String? employeeName;
  final String vendorName;
  final double amount;
  final String currency;
  final String claimDate;
  final String category;
  final String? gstin;
  final ClaimStatus status;
  final String? managerNotes;
  final String? rejectionReason;
  final Receipt? receipt;
  final RiskAssessment? riskAssessment;
  final DateTime createdAt;

  Claim({
    required this.id,
    this.organizationId,
    required this.employeeId,
    this.employeeName,
    required this.vendorName,
    required this.amount,
    this.currency = 'INR',
    required this.claimDate,
    required this.category,
    this.gstin,
    required this.status,
    this.managerNotes,
    this.rejectionReason,
    this.receipt,
    this.riskAssessment,
    required this.createdAt,
  });

  factory Claim.fromJson(Map<String, dynamic> json) {
    final statusStr = (json['status'] ?? 'PENDING').toString().toUpperCase();
    ClaimStatus status;
    if (statusStr == 'APPROVED') {
      status = ClaimStatus.approved;
    } else if (statusStr == 'REJECTED') {
      status = ClaimStatus.rejected;
    } else if (statusStr == 'CLARIFICATION_REQUESTED') {
      status = ClaimStatus.clarificationRequested;
    } else if (statusStr == 'REVIEW_REQUIRED') {
      status = ClaimStatus.reviewRequired;
    } else {
      status = ClaimStatus.pending;
    }

    return Claim(
      id: json['id'] ?? '',
      organizationId: json['organizationId'],
      employeeId: json['employeeId'] ?? '',
      employeeName: json['employeeName'] ?? json['employee']?['name'],
      vendorName: json['vendorName'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'INR',
      claimDate: json['claimDate'] ?? '',
      category: (json['category'] ?? 'MISC').toString().toUpperCase(),
      gstin: json['gstin'],
      status: status,
      managerNotes: json['managerNotes'],
      rejectionReason: json['rejectionReason'],
      receipt: json['receipt'] != null ? Receipt.fromJson(json['receipt']) : null,
      riskAssessment: json['riskAssessment'] != null ? RiskAssessment.fromJson(json['riskAssessment']) : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
