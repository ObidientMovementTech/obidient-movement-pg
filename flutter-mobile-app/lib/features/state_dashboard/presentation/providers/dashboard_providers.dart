import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/dashboard_remote_datasource.dart';
import '../../data/datasources/coordinator_remote_datasource.dart';
import '../../data/models/dashboard_data.dart';
import '../../data/models/coordinator_models.dart';

// ── Datasources ──────────────────────────────────────────────

final dashboardDsProvider = Provider((ref) {
  return DashboardRemoteDataSource(ref.watch(apiClientProvider));
});

final coordinatorDsProvider = Provider((ref) {
  return CoordinatorRemoteDataSource(ref.watch(apiClientProvider));
});

// ── User Level ───────────────────────────────────────────────

final userLevelProvider = FutureProvider.autoDispose<UserLevelInfo>((ref) {
  final ds = ref.watch(dashboardDsProvider);
  return ds.getUserLevel();
});

// ── Dashboard State ──────────────────────────────────────────

class DashboardState {
  final DashboardResponse? response;
  final bool loading;
  final String? error;

  const DashboardState({this.response, this.loading = false, this.error});

  DashboardState copyWith({
    DashboardResponse? response,
    bool? loading,
    String? error,
  }) {
    return DashboardState(
      response: response ?? this.response,
      loading: loading ?? this.loading,
      error: error,
    );
  }
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  final DashboardRemoteDataSource _ds;
  DashboardNotifier(this._ds) : super(const DashboardState());

  Future<void> loadNational() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await _ds.getNationalData();
      state = DashboardState(response: data, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> loadState(String stateId) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await _ds.getStateData(stateId);
      state = DashboardState(response: data, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> loadLGA(String lgaId) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await _ds.getLGAData(lgaId);
      state = DashboardState(response: data, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> loadWard(String wardId) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await _ds.getWardData(wardId);
      state = DashboardState(response: data, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> loadPollingUnit(String puId) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await _ds.getPollingUnitData(puId);
      state = DashboardState(response: data, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> loadInitial(UserLevelInfo userLevel) async {
    switch (userLevel.userLevel) {
      case 'national':
        await loadNational();
      case 'state':
        final loc = userLevel.assignedLocation;
        if (loc != null && loc['stateId'] != null) {
          await loadState(loc['stateId'] as String);
        }
      case 'lga':
        final loc = userLevel.assignedLocation;
        if (loc != null && loc['lgaSlug'] != null) {
          final stateId = loc['stateId'] as String;
          final lgaSlug = loc['lgaSlug'] as String;
          await loadLGA('$stateId-$lgaSlug');
        }
      case 'ward':
        final loc = userLevel.assignedLocation;
        if (loc != null && loc['wardSlug'] != null) {
          final stateId = loc['stateId'] as String;
          final lgaSlug = loc['lgaSlug'] as String;
          final wardSlug = loc['wardSlug'] as String;
          await loadWard('$stateId-$lgaSlug-$wardSlug');
        }
    }
  }
}

final dashboardProvider =
    StateNotifierProvider.autoDispose<DashboardNotifier, DashboardState>((ref) {
  final ds = ref.watch(dashboardDsProvider);
  return DashboardNotifier(ds);
});

// ── Coordinator search ───────────────────────────────────────

final coordinatorSearchProvider = FutureProvider.autoDispose
    .family<List<SearchedUser>, String>((ref, query) async {
  if (query.length < 2) return [];
  final ds = ref.watch(coordinatorDsProvider);
  return ds.searchUsers(query);
});

// ── Subordinates ─────────────────────────────────────────────

/// Parameters for the subordinates query.
typedef SubordinatesParams = ({int page, String? designation, String? q});

final subordinatesProvider = FutureProvider.autoDispose
    .family<({List<SearchedUser> subordinates, int total, int pages}),
        SubordinatesParams>((ref, params) {
  final ds = ref.watch(coordinatorDsProvider);
  return ds.getSubordinates(
    page: params.page,
    limit: 30,
    designation: params.designation,
    q: params.q,
  );
});

// ── Nigeria locations (cascading) ────────────────────────────

final nigeriaStatesProvider =
    FutureProvider.autoDispose<List<NigeriaLocation>>((ref) {
  final ds = ref.watch(coordinatorDsProvider);
  return ds.getStates();
});

final nigeriaLGAsProvider = FutureProvider.autoDispose
    .family<List<NigeriaLocation>, int>((ref, stateId) {
  final ds = ref.watch(coordinatorDsProvider);
  return ds.getLGAs(stateId);
});

final nigeriaWardsProvider = FutureProvider.autoDispose
    .family<List<NigeriaLocation>, int>((ref, lgaId) {
  final ds = ref.watch(coordinatorDsProvider);
  return ds.getWards(lgaId);
});

final nigeriaPollingUnitsProvider = FutureProvider.autoDispose
    .family<List<NigeriaLocation>, int>((ref, wardId) {
  final ds = ref.watch(coordinatorDsProvider);
  return ds.getPollingUnits(wardId);
});
