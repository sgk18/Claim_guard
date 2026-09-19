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
        title: const Text('Expense Claims Queue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => widget.state.loadClaims(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            color: ClaimGuardTheme.surfaceWhite,
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search merchant, ID, or category...',
                    prefixIcon: const Icon(Icons.search, size: 20, color: ClaimGuardTheme.slateMuted),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () => setState(() => _searchQuery = ''),
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildChip('ALL', 'All (${widget.state.claims.length})'),
                      _buildChip('PENDING', 'Pending (${widget.state.pendingCount})'),
                      _buildChip('FLAGGED', 'Flagged (${widget.state.flaggedCount})'),
                      _buildChip('APPROVED', 'Approved (${widget.state.approvedCount})'),
                      _buildChip('REJECTED', 'Rejected (${widget.state.rejectedCount})'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: ClaimGuardTheme.slateBorder),

          // Claims Feed
          Expanded(
            child: widget.state.isLoading
                ? const Center(child: CircularProgressIndicator(color: ClaimGuardTheme.brandOrange))
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.inbox_outlined, size: 48, color: ClaimGuardTheme.slateMuted),
                            const SizedBox(height: 12),
                            const Text(
                              'No Claims Found',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _searchQuery.isNotEmpty ? 'No matches for "$_searchQuery"' : 'No claims matching current filter',
                              style: const TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
                            ),
                          ],
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

  Widget _buildChip(String filterKey, String label) {
    final isSelected = _selectedFilter == filterKey;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected ? ClaimGuardTheme.surfaceWhite : ClaimGuardTheme.slateDark,
          ),
        ),
        selected: isSelected,
        selectedColor: ClaimGuardTheme.slateDark,
        backgroundColor: ClaimGuardTheme.canvasOffWhite,
        side: BorderSide(
          color: isSelected ? ClaimGuardTheme.slateDark : ClaimGuardTheme.slateBorder,
          width: 1,
        ),
        onSelected: (_) {
          setState(() => _selectedFilter = filterKey);
        },
      ),
    );
  }
}
