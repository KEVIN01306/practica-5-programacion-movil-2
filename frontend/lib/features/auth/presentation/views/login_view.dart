import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../controllers/auth_controller.dart';

class LoginView extends StatefulWidget {
  final AuthController authController;
  final VoidCallback onLoginSuccess;

  const LoginView({
    super.key,
    required this.authController,
    required this.onLoginSuccess,
  });

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _obscurePassword = true;
  String? _emailError;
  String? _passwordError;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _validateInputs() {
    setState(() {
      _emailError = null;
      _passwordError = null;
    });

    final email = _emailController.text.trim();
    final password = _passwordController.text;

    // Email format with @ and valid domain pattern
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (email.isEmpty) {
      setState(() => _emailError = 'El correo electrónico es obligatorio');
      return false;
    } else if (!emailRegex.hasMatch(email)) {
      setState(() => _emailError = 'Ingresa un correo válido (ej. usuario@dominio.com)');
      return false;
    }

    if (password.isEmpty) {
      setState(() => _passwordError = 'La contraseña es obligatoria');
      return false;
    } else if (password.length < 6) {
      setState(() => _passwordError = 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  }

  Future<void> _handleLogin() async {
    if (!_validateInputs()) return;

    final success = await widget.authController.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (success && mounted) {
      widget.onLoginSuccess();
    } else if (mounted && widget.authController.errorMessage != null) {
      showCupertinoAlert(
        context: context,
        title: 'Error de Autenticación',
        message: widget.authController.errorMessage!,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: AppCupertinoTheme.scaffoldBackground,
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: AnimatedBuilder(
              animation: widget.authController,
              builder: (context, _) {
                final isLoading = widget.authController.isLoading;

                return Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand / Logo Header
                    Center(
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppCupertinoTheme.primaryColor,
                          borderRadius: BorderRadius.circular(20.0),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x33007AFF),
                              blurRadius: 16.0,
                              offset: Offset(0, 6),
                            ),
                          ],
                        ),
                        child: const Icon(
                          CupertinoIcons.cube_box_fill,
                          color: CupertinoColors.white,
                          size: 44.0,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20.0),
                    const Text(
                      'Sistema de Inventario',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 26.0,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -0.5,
                        color: CupertinoColors.label,
                      ),
                    ),
                    const SizedBox(height: 6.0),
                    const Text(
                      'Identifícate para registrar y gestionar movimientos',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14.0,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    ),
                    const SizedBox(height: 36.0),

                    // Inputs Card
                    CupertinoCard(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Email field
                          const Text(
                            'Correo electrónico',
                            style: TextStyle(
                              fontSize: 13.0,
                              fontWeight: FontWeight.w600,
                              color: CupertinoColors.secondaryLabel,
                            ),
                          ),
                          const SizedBox(height: 8.0),
                          CupertinoTextField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            autocorrect: false,
                            placeholder: 'ejemplo@empresa.com',
                            prefix: const Padding(
                              padding: EdgeInsets.only(left: 10.0),
                              child: Icon(
                                CupertinoIcons.mail_solid,
                                color: CupertinoColors.systemGrey,
                                size: 18.0,
                              ),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0),
                            decoration: BoxDecoration(
                              color: CupertinoColors.systemGrey6,
                              borderRadius: BorderRadius.circular(8.0),
                              border: Border.all(
                                color: _emailError != null
                                    ? CupertinoColors.systemRed
                                    : CupertinoColors.systemGrey4,
                              ),
                            ),
                          ),
                          if (_emailError != null) ...[
                            const SizedBox(height: 4.0),
                            Text(
                              _emailError!,
                              style: const TextStyle(
                                fontSize: 12.0,
                                color: CupertinoColors.systemRed,
                              ),
                            ),
                          ],

                          const SizedBox(height: 18.0),

                          // Password field
                          const Text(
                            'Contraseña',
                            style: TextStyle(
                              fontSize: 13.0,
                              fontWeight: FontWeight.w600,
                              color: CupertinoColors.secondaryLabel,
                            ),
                          ),
                          const SizedBox(height: 8.0),
                          CupertinoTextField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            placeholder: '••••••••',
                            prefix: const Padding(
                              padding: EdgeInsets.only(left: 10.0),
                              child: Icon(
                                CupertinoIcons.lock_shield_fill,
                                color: CupertinoColors.systemGrey,
                                size: 18.0,
                              ),
                            ),
                            suffix: CupertinoButton(
                              padding: const EdgeInsets.symmetric(horizontal: 10.0),
                              minimumSize: Size.zero,
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                              child: Icon(
                                _obscurePassword
                                    ? CupertinoIcons.eye_slash
                                    : CupertinoIcons.eye,
                                color: CupertinoColors.systemGrey,
                                size: 20.0,
                              ),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0),
                            decoration: BoxDecoration(
                              color: CupertinoColors.systemGrey6,
                              borderRadius: BorderRadius.circular(8.0),
                              border: Border.all(
                                color: _passwordError != null
                                    ? CupertinoColors.systemRed
                                    : CupertinoColors.systemGrey4,
                              ),
                            ),
                          ),
                          if (_passwordError != null) ...[
                            const SizedBox(height: 4.0),
                            Text(
                              _passwordError!,
                              style: const TextStyle(
                                fontSize: 12.0,
                                color: CupertinoColors.systemRed,
                              ),
                            ),
                          ],

                          const SizedBox(height: 24.0),

                          // Login Button
                          SizedBox(
                            width: double.infinity,
                            child: CupertinoButton.filled(
                              onPressed: isLoading ? null : _handleLogin,
                              borderRadius: BorderRadius.circular(10.0),
                              child: isLoading
                                  ? const CupertinoActivityIndicator(
                                      color: CupertinoColors.white,
                                    )
                                  : const Text(
                                      'Iniciar Sesión',
                                      style: TextStyle(
                                        fontSize: 16.0,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24.0),
                    const Center(
                      child: Text(
                        'Acceso restringido a personal autorizado (ADMIN / OPERADOR)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12.0,
                          color: CupertinoColors.tertiaryLabel,
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
