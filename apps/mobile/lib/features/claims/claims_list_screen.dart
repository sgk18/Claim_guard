import 'package:flutter/material.dart';
import '../../core/models/claim.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';
import '../../core/widgets/claim_card.dart';

class ClaimsListScreen extends StatefulWidget {
  final AppState state;
  final Function(Claim) onClaimTap;

  const ClaimsListScreen({
    super.key,
    required this.state,
    required this.onClaimTap,
  });

  @override
  State<ClaimsListScreen> createState() => _ClaimsListScreenState();
}

class _ClaimsListScreenState extends State<ClaimsListScreen> {
  String _selectedFilter = 'ALL';
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    List<Claim> filtered = widget.state.claims;

    // Filter by Status / Risk
    if (_selectedFilter == 'PENDING') {
      filtered = filtered.where((c) => c.status == ClaimStatus.pending || c.status == ClaimStatus.reviewRequired).toList();
    } else if (_selectedFilter == 'FLAGGED') {
      filtered = filtered.where((c) => c.riskAssessment?.level == RiskLevel.high || c.riskAssessment?.level == RiskLevel.critical).toList();
    } else if (_selectedFilter == 'APPROVED') {
      filtered = filtered.where((c) => c.status == ClaimStatus.approved).toList();
    } else if (_selectedFilter == 'REJECTED') {
      filtered = filtered.where((c) => c.status == ClaimStatus.rejected).toList();
    }

    // Filter by Search Query
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      filtered = filtered.where((c) {
        return c.vendorName.toLowerCase().contains(q) ||
            c.id.toLowerCase().contains(q) ||
            c.category.toLowerCase().contains(q);
      }).toList();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Expense Claims Queue',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: -0.3),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 20),
            tooltip: 'Refresh Queue',
            onPressed: () => widget.state.loadClaims(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header Container
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            decoration: const BoxDecoration(
              color: ClaimGuardTheme.surfaceWhite,
              border: Border(bottom: BorderSide(color: ClaimGuardTheme.slateBorder)),
            ),
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search merchant, claim ID, or category...',
                    hintStyle: const TextStyle(fontSize: 13, color: ClaimGuardTheme.slateMuted),
                    prefixIcon: const Icon(Icons.search_rounded, size: 20, color: ClaimGuardTheme.slateMuted),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    filled: true,
                    fillColor: ClaimGuardTheme.canvasOffWhite,
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18),
                            onPressed: () => setState(() => _searchQuery = ''),
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: ClaimGuardTheme.slateBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: ClaimGuardTheme.slateBorder),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: ClaimGuardTheme.slateDark, width: 1.5),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildChip('ALL', 'All', widget.state.claims.length),
                      _buildChip('PENDING', 'Pending', widget.state.pendingCount),
                      _buildChip('FLAGGED', 'Flagged', widget.state.flaggedCount, isAlert: widget.state.flaggedCount > 0),
                      _buildChip('APPROVED', 'Approved', widget.state.approvedCount),
                      _buildChip('REJECTED', 'Rejected', widget.state.rejectedCount),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Claims Feed List
          Expanded(
            child: widget.state.isLoading
                ? const Center(child: CircularProgressIndicator(color: ClaimGuardTheme.brandOrange))
                : filtered.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 64,
                                height: 64,
                                decoration: BoxDecoration(
                                  color: ClaimGuardTheme.canvasOffWhite,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: ClaimGuardTheme.slateBorder),
                                ),
                                child: const Icon(Icons.inbox_outlined, size: 30, color: ClaimGuardTheme.slateMuted),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'No Claims Found',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _searchQuery.isNotEmpty
                                    ? 'No expense claims match "$_searchQuery"'
                                    : 'There are no claims currently in this queue.',
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted, height: 1.4),
                              ),
                            ],
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => widget.state.loadClaims(),
                        color: ClaimGuardTheme.brandOrange,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (_, index) {
                            final claim = filtered[index];
                            return ClaimCard(
                              claim: claim,
                              onTap: () => widget.onClaimTap(claim),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String filterKey, String label, int count, {bool isAlert = false}) {
    final isSelected = _selectedFilter == filterKey;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => setState(() => _selectedFilter = filterKey),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: isSelected
                ? ClaimGuardTheme.slateDark
                : isAlert
                    ? ClaimGuardTheme.riskHigh.withAlpha(20)
                    : ClaimGuardTheme.canvasOffWhite,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected
                  ? ClaimGuardTheme.slateDark
                  : isAlert
                      ? ClaimGuardTheme.riskHigh.withAlpha(80)
                      : ClaimGuardTheme.slateBorder,
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: isSelected
                      ? Colors.white
                      : isAlert
                          ? ClaimGuardTheme.riskHigh
                          : ClaimGuardTheme.slateDark,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withAlpha(40)
                      : isAlert
                          ? ClaimGuardTheme.riskHigh.withAlpha(40)
                          : ClaimGuardTheme.slateBorder.withAlpha(120),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: isSelected
                        ? Colors.white
                        : isAlert
                            ? ClaimGuardTheme.riskHigh
                            : ClaimGuardTheme.slateSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
