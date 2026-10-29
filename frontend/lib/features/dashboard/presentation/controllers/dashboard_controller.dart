import 'package:flutter/cupertino.dart';
import '../../domain/dashboard_metrics.dart';
import '../../domain/dashboard_repository.dart';
import '../../infrastructure/dashboard_repository_impl.dart';

class DashboardController extends ChangeNotifier {
  final DashboardRepository _repository;

  bool _isLoading = false;
  String? _errorMessage;
  DashboardMetrics _metrics = DashboardMetrics.empty();

  DashboardController({DashboardRepository? repository})
      : _repository = repository ?? DashboardRepositoryImpl();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  DashboardMetrics get metrics => _metrics;

  Future<void> loadDashboard() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _metrics = await _repository.getMetrics();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
}
