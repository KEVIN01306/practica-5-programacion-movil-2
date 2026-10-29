enum MovementType {
  entry('ENTRY'),
  exit('EXIT'),
  adjust('ADJUST');

  final String value;
  const MovementType(this.value);

  static MovementType fromString(String val) {
    switch (val.toUpperCase()) {
      case 'ENTRY':
        return MovementType.entry;
      case 'EXIT':
        return MovementType.exit;
      case 'ADJUST':
        return MovementType.adjust;
      default:
        return MovementType.entry;
    }
  }
}

class StockMovement {
  final String id;
  final String productId;
  final String? productName;
  final String? productCode;
  final MovementType type;
  final int quantity;
  final int previousStock;
  final int resultingStock;
  final String reason;
  final String? notes;
  final String userId;
  final String? userName;
  final DateTime createdAt;

  const StockMovement({
    required this.id,
    required this.productId,
    this.productName,
    this.productCode,
    required this.type,
    required this.quantity,
    required this.previousStock,
    required this.resultingStock,
    required this.reason,
    this.notes,
    required this.userId,
    this.userName,
    required this.createdAt,
  });

  factory StockMovement.fromJson(Map<String, dynamic> json) {
    return StockMovement(
      id: json['id'] as String,
      productId: json['productId'] as String,
      productName: json['productName'] as String?,
      productCode: json['productCode'] as String?,
      type: MovementType.fromString(json['type'] as String),
      quantity: json['quantity'] as int,
      previousStock: json['previousStock'] as int,
      resultingStock: json['resultingStock'] as int,
      reason: json['reason'] as String,
      notes: json['notes'] as String?,
      userId: json['userId'] as String,
      userName: json['userName'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'productId': productId,
    'productName': productName,
    'productCode': productCode,
    'type': type.value,
    'quantity': quantity,
    'previousStock': previousStock,
    'resultingStock': resultingStock,
    'reason': reason,
    'notes': notes,
    'userId': userId,
    'userName': userName,
    'createdAt': createdAt.toIso8601String(),
  };
}
