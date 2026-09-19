import 'package:flutter/material.dart';
import '../models/session.dart';
import '../theme/claimguard_theme.dart';

class BrandHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final Role? role;
  final List<Widget>? actions;

  const BrandHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.role,
    this.actions,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      titleSpacing: 16,
      automaticallyImplyLeading: false,
      title: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: ClaimGuardTheme.brandOrange,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.shield_outlined,
              color: ClaimGuardTheme.surfaceWhite,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: ClaimGuardTheme.slateDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                    ),
                  ),
                  if (role != null) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: role == Role.manager ? ClaimGuardTheme.brandOrange.withAlpha(25) : ClaimGuardTheme.slateBorder.withAlpha(50),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: role == Role.manager ? ClaimGuardTheme.brandOrange : ClaimGuardTheme.slateMuted,
                          width: 0.8,
                        ),
                      ),
                      child: Text(
                        role == Role.manager ? 'MANAGER' : 'EMPLOYEE',
                        style: TextStyle(
                          color: role == Role.manager ? ClaimGuardTheme.brandOrange : ClaimGuardTheme.slateDark,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              if (subtitle != null)
                Text(
                  subtitle!,
                  style: const TextStyle(
                    color: ClaimGuardTheme.slateMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
        ],
      ),
      actions: actions,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(
          color: ClaimGuardTheme.slateBorder,
          height: 1,
        ),
      ),
    );
  }
}
