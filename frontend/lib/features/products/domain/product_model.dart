class Product {
  final String id;
  final String code;
  final String name;
  final String? description;
  final double costPrice;
  final double salePrice;
  final int currentStock;
  final int minStock;
  final String? imageUrl;
  final bool isActive;
  final String categoryId;
  final String? categoryName;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Product({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    required this.costPrice,
    required this.salePrice,
    required this.currentStock,
    required this.minStock,
    this.imageUrl,
    required this.isActive,
    required this.categoryId,
    this.categoryName,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isLowStock => currentStock <= minStock;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      costPrice: (json['costPrice'] as num).toDouble(),
      salePrice: (json['salePrice'] as num).toDouble(),
      currentStock: json['currentStock'] as int? ?? 0,
      minStock: json['minStock'] as int? ?? 0,
      imageUrl: json['imageUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      categoryId: json['categoryId'] as String,
      categoryName: json['categoryName'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'name': name,
    'description': description,
    'costPrice': costPrice,
    'salePrice': salePrice,
    'currentStock': currentStock,
    'minStock': minStock,
    'imageUrl': imageUrl,
    'isActive': isActive,
    'categoryId': categoryId,
    'categoryName': categoryName,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
}
