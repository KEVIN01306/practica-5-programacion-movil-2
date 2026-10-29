import 'dashboard_metrics.dart';

abstract class DashboardRepository {
  Future<DashboardMetrics> getMetrics();
}
