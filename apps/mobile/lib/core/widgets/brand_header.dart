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
      backgroundColor: ClaimGuardTheme.surfaceWhite,
      surfaceTintColor: Colors.transparent,
      title: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: ClaimGuardTheme.brandGradient,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: ClaimGuardTheme.brandOrange.withAlpha(50),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.shield_rounded,
                color: ClaimGuardTheme.surfaceWhite,
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        title,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: ClaimGuardTheme.slateDark,
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                    if (role != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: role == Role.manager
                              ? ClaimGuardTheme.brandOrangeSurface
                              : ClaimGuardTheme.canvasOffWhite,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: role == Role.manager
                                ? ClaimGuardTheme.brandOrange.withAlpha(120)
                                : ClaimGuardTheme.slateBorder,
                            width: 1,
                          ),
                        ),
                        child: Text(
                          role == Role.manager ? 'MANAGER' : 'EMPLOYEE',
                          style: TextStyle(
                            color: role == Role.manager
                                ? ClaimGuardTheme.brandOrange
                                : ClaimGuardTheme.slateDark,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: ClaimGuardTheme.slateMuted,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
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
