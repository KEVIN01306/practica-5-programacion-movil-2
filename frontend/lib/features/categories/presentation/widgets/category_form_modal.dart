import 'package:flutter/cupertino.dart';
import '../../domain/category_model.dart';

Future<Category?> showCategoryFormModal({
  required BuildContext context,
  required Future<Category?> Function(String name, String? description) onSubmit,
}) {
  return showCupertinoModalPopup<Category>(
    context: context,
    builder: (BuildContext ctx) => CategoryFormModal(onSubmit: onSubmit),
  );
}

class CategoryFormModal extends StatefulWidget {
  final Future<Category?> Function(String name, String? description) onSubmit;

  const CategoryFormModal({
    super.key,
    required this.onSubmit,
  });

  @override
  State<CategoryFormModal> createState() => _CategoryFormModalState();
}

class _CategoryFormModalState extends State<CategoryFormModal> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final name = _nameController.text.trim();
    final desc = _descController.text.trim();

    if (name.isEmpty) {
      setState(() {
        _errorMessage = 'El nombre de la categoría es requerido.';
      });
      return;
    }

    if (name.length < 2) {
      setState(() {
        _errorMessage = 'El nombre debe tener al menos 2 caracteres.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final category = await widget.onSubmit(
        name,
        desc.isNotEmpty ? desc : null,
      );

      if (!mounted) return;

      if (category != null) {
        Navigator.of(context).pop(category);
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage = 'No se pudo crear la categoría. Intente nuevamente.';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: const BoxDecoration(
        color: CupertinoColors.systemBackground,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16.0)),
      ),
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Nueva Categoría',
                    style: TextStyle(
                      fontSize: 18.0,
                      fontWeight: FontWeight.bold,
                      color: CupertinoColors.label,
                    ),
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                    child: const Icon(
                      CupertinoIcons.clear_thick_circled,
                      color: CupertinoColors.systemGrey3,
                      size: 24.0,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14.0),

              // Error display if present
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
                  decoration: BoxDecoration(
                    color: CupertinoColors.systemRed.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(
                      color: CupertinoColors.systemRed.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        CupertinoIcons.exclamationmark_circle_fill,
                        color: CupertinoColors.systemRed,
                        size: 18.0,
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                            fontSize: 13.0,
                            color: CupertinoColors.systemRed,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14.0),
              ],

              // Category Name
              const Text(
                'Nombre de la categoría *',
                style: TextStyle(
                  fontSize: 13.0,
                  fontWeight: FontWeight.w600,
                  color: CupertinoColors.secondaryLabel,
                ),
              ),
              const SizedBox(height: 6.0),
              CupertinoTextField(
                controller: _nameController,
                placeholder: 'ej. Tornillería, Pinturas, Herramientas...',
                padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                autofocus: true,
                textCapitalization: TextCapitalization.sentences,
                decoration: BoxDecoration(
                  color: CupertinoColors.systemGrey6,
                  borderRadius: BorderRadius.circular(10.0),
                  border: Border.all(color: CupertinoColors.systemGrey4),
                ),
                onChanged: (_) {
                  if (_errorMessage != null) {
                    setState(() => _errorMessage = null);
                  }
                },
                onSubmitted: (_) => _handleSubmit(),
              ),
              const SizedBox(height: 16.0),

              // Description
              const Text(
                'Descripción (opcional)',
                style: TextStyle(
                  fontSize: 13.0,
                  fontWeight: FontWeight.w600,
                  color: CupertinoColors.secondaryLabel,
                ),
              ),
              const SizedBox(height: 6.0),
              CupertinoTextField(
                controller: _descController,
                placeholder: 'Detalles u observaciones de los artículos en esta categoría...',
                padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                maxLines: 3,
                minLines: 2,
                textCapitalization: TextCapitalization.sentences,
                decoration: BoxDecoration(
                  color: CupertinoColors.systemGrey6,
                  borderRadius: BorderRadius.circular(10.0),
                  border: Border.all(color: CupertinoColors.systemGrey4),
                ),
              ),
              const SizedBox(height: 24.0),

              // Actions
              Row(
                children: [
                  Expanded(
                    child: CupertinoButton(
                      padding: const EdgeInsets.symmetric(vertical: 14.0),
                      color: CupertinoColors.systemGrey5,
                      borderRadius: BorderRadius.circular(10.0),
                      onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                      child: const Text(
                        'Cancelar',
                        style: TextStyle(
                          fontSize: 15.0,
                          fontWeight: FontWeight.w600,
                          color: CupertinoColors.label,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: CupertinoButton.filled(
                      padding: const EdgeInsets.symmetric(vertical: 14.0),
                      borderRadius: BorderRadius.circular(10.0),
                      onPressed: _isLoading ? null : _handleSubmit,
                      child: _isLoading
                          ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                          : const Text(
                              'Crear Categoría',
                              style: TextStyle(
                                fontSize: 15.0,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
