import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:user_repository/user_repository.dart';
import '../../../components/my_text_field.dart';
import '../blocs/sign_up_bloc/sign_up_bloc.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMsg;

  bool _hasUpperCase = false;
  bool _hasLowerCase = false;
  bool _hasNumber = false;
  bool _hasSpecialChar = false;
  bool _hasMinLength = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _onPasswordChanged(String? val) {
    if (val == null) return;
    setState(() {
      _hasUpperCase = val.contains(RegExp(r'[A-Z]'));
      _hasLowerCase = val.contains(RegExp(r'[a-z]'));
      _hasNumber = val.contains(RegExp(r'[0-9]'));
      _hasSpecialChar =
          val.contains(RegExp(r'[!@#$&*~`)\%\-(_+=;:,.<>/?"\[{\]}\|^]'));
      _hasMinLength = val.length >= 8;
    });
  }

  Widget _buildPasswordRule(String label, bool met) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          met ? CupertinoIcons.checkmark_circle_fill : CupertinoIcons.circle,
          size: 12,
          color: met
              ? Colors.green
              : Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: met
                ? Colors.green
                : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<SignUpBloc, SignUpState>(
      listener: (context, state) {
        if (state is SignUpSuccess) {
          setState(() => _isLoading = false);
        } else if (state is SignUpProcess) {
          setState(() {
            _isLoading = true;
            _errorMsg = null;
          });
        } else if (state is SignUpFailure) {
          setState(() {
            _isLoading = false;
            _errorMsg = 'Sign up failed. Please try again.';
          });
        }
      },
      child: Form(
        key: _formKey,
        child: Center(
          child: Column(
            children: [
              const SizedBox(height: 20),
              SizedBox(
                width: MediaQuery.of(context).size.width * 0.9,
                child: MyTextField(
                  controller: _emailController,
                  hintText: 'Email',
                  obscureText: false,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(CupertinoIcons.mail_solid),
                  validator: (val) {
                    if (val == null || val.isEmpty) {
                      return 'Please fill in this field';
                    }
                    if (!RegExp(r'^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$')
                        .hasMatch(val)) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: MediaQuery.of(context).size.width * 0.9,
                child: MyTextField(
                  controller: _passwordController,
                  hintText: 'Password',
                  obscureText: _obscurePassword,
                  keyboardType: TextInputType.visiblePassword,
                  prefixIcon: const Icon(CupertinoIcons.lock_fill),
                  onChanged: (val) {
                    _onPasswordChanged(val);
                    return null;
                  },
                  suffixIcon: IconButton(
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                    icon: Icon(
                      _obscurePassword
                          ? CupertinoIcons.eye_fill
                          : CupertinoIcons.eye_slash_fill,
                    ),
                  ),
                  validator: (val) {
                    if (val == null || val.isEmpty) {
                      return 'Please fill in this field';
                    }
                    if (!RegExp(
                            r'^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$&*~`)\%\-(_+=;:,.<>/?"\[{\]}\|^]).{8,}$')
                        .hasMatch(val)) {
                      return 'Password does not meet requirements';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Wrap(
                  spacing: 12,
                  runSpacing: 4,
                  children: [
                    _buildPasswordRule('Uppercase', _hasUpperCase),
                    _buildPasswordRule('Lowercase', _hasLowerCase),
                    _buildPasswordRule('Number', _hasNumber),
                    _buildPasswordRule('Special char', _hasSpecialChar),
                    _buildPasswordRule('8+ chars', _hasMinLength),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: MediaQuery.of(context).size.width * 0.9,
                child: MyTextField(
                  controller: _nameController,
                  hintText: 'Name',
                  obscureText: false,
                  keyboardType: TextInputType.name,
                  prefixIcon: const Icon(CupertinoIcons.person_fill),
                  validator: (val) {
                    if (val == null || val.isEmpty) {
                      return 'Please fill in this field';
                    }
                    if (val.length > 30) return 'Name too long';
                    return null;
                  },
                ),
              ),
              if (_errorMsg != null) ...[
                const SizedBox(height: 8),
                Text(
                  _errorMsg!,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.error,
                    fontSize: 13,
                  ),
                ),
              ],
              SizedBox(height: MediaQuery.of(context).size.height * 0.02),
              if (_isLoading)
                CircularProgressIndicator(
                  color: Theme.of(context).colorScheme.primary,
                )
              else
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.5,
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // Cria nova instância — não muta MyUser.empty
                        final newUser = MyUser(
                          userId: '',
                          email: _emailController.text.trim(),
                          name: _nameController.text.trim(),
                          hasActiveCart: false,
                        );
                        context.read<SignUpBloc>().add(
                              SignUpRequired(newUser, _passwordController.text),
                            );
                      }
                    },
                    child: const Text('Sign Up'),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
