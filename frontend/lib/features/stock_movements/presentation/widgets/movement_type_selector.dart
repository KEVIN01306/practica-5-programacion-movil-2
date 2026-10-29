import 'package:flutter/cupertino.dart';
import '../../domain/stock_movement_model.dart';

class MovementTypeSelector extends StatelessWidget {
  final MovementType selectedType;
  final ValueChanged<MovementType> onTypeChanged;

  const MovementTypeSelector({
    super.key,
    required this.selectedType,
    required this.onTypeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: double.infinity,
        child: CupertinoSlidingSegmentedControl<MovementType>(
          groupValue: selectedType,
          children: const {
            MovementType.entry: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    CupertinoIcons.arrow_down_circle_fill,
                    size: 16,
                    color: CupertinoColors.systemGreen,
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Entrada',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            MovementType.exit: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    CupertinoIcons.arrow_up_circle_fill,
                    size: 16,
                    color: CupertinoColors.systemRed,
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Salida',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            MovementType.adjust: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    CupertinoIcons.slider_horizontal_3,
                    size: 16,
                    color: CupertinoColors.systemPurple,
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Ajuste',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          },
          onValueChanged: (val) {
            if (val != null) {
              onTypeChanged(val);
            }
          },
        ),
      ),
    );
  }
}
