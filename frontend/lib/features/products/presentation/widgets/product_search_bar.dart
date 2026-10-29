import 'package:flutter/cupertino.dart';
import '../../../categories/domain/category_model.dart';

class ProductSearchBar extends StatelessWidget {
  final TextEditingController searchController;
  final ValueChanged<String> onSearchChanged;
  final List<Category> categories;
  final String? selectedCategoryId;
  final VoidCallback onCategoryTap;
  final bool filterLowStock;
  final ValueChanged<bool> onToggleLowStock;

  const ProductSearchBar({
    super.key,
    required this.searchController,
    required this.onSearchChanged,
    required this.categories,
    required this.selectedCategoryId,
    required this.onCategoryTap,
    required this.filterLowStock,
    required this.onToggleLowStock,
  });

  @override
  Widget build(BuildContext context) {
    String selectedCategoryName = 'Todas las categorías';
    if (selectedCategoryId != null && categories.isNotEmpty) {
      final match = categories.where((c) => c.id == selectedCategoryId);
      if (match.isNotEmpty) {
        selectedCategoryName = match.first.name;
      }
    }

    return Container(
      color: CupertinoColors.secondarySystemGroupedBackground,
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
      child: Column(
        children: [
          CupertinoSearchTextField(
            controller: searchController,
            placeholder: 'Buscar por nombre o código único...',
            onChanged: onSearchChanged,
            onSuffixTap: () {
              searchController.clear();
              onSearchChanged('');
            },
          ),
          const SizedBox(height: 8.0),
          Row(
            children: [
              Expanded(
                child: CupertinoButton(
                  padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 7.0),
                  color: CupertinoColors.systemGrey6,
                  borderRadius: BorderRadius.circular(8.0),
                  onPressed: onCategoryTap,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          selectedCategoryName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13.0,
                            color: CupertinoColors.label,
                          ),
                        ),
                      ),
                      const Icon(
                        CupertinoIcons.chevron_down,
                        size: 14.0,
                        color: CupertinoColors.systemGrey,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8.0),
              CupertinoButton(
                padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 7.0),
                color: filterLowStock
                    ? CupertinoColors.systemRed.withValues(alpha: 0.15)
                    : CupertinoColors.systemGrey6,
                borderRadius: BorderRadius.circular(8.0),
                onPressed: () => onToggleLowStock(!filterLowStock),
                child: Row(
                  children: [
                    Icon(
                      CupertinoIcons.exclamationmark_triangle_fill,
                      size: 14.0,
                      color: filterLowStock
                          ? CupertinoColors.systemRed
                          : CupertinoColors.systemGrey,
                    ),
                    const SizedBox(width: 4.0),
                    Text(
                      'Stock Bajo',
                      style: TextStyle(
                        fontSize: 13.0,
                        fontWeight: filterLowStock ? FontWeight.bold : FontWeight.normal,
                        color: filterLowStock
                            ? CupertinoColors.systemRed
                            : CupertinoColors.label,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
