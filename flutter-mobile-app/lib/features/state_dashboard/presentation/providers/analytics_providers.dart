import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/analytics_remote_datasource.dart';
import '../../data/models/analytics_models.dart';

// ── Datasource ───────────────────────────────────────────────

final analyticsDsProvider = Provider((ref) {
  return AnalyticsRemoteDataSource(ref.watch(apiClientProvider));
});

// ── Demographics ─────────────────────────────────────────────

/// Parameters to fetch demographics for a specific scope.
typedef DemographicsParams = ({String level, String locationId, String? locationName});

final demographicsProvider = FutureProvider.autoDispose
    .family<DemographicsData, DemographicsParams>((ref, params) {
  final ds = ref.watch(analyticsDsProvider);
  return ds.getDemographics(
    level: params.level,
    locationId: params.locationId,
    locationName: params.locationName,
  );
});

// ── People ───────────────────────────────────────────────────

class PeopleState {
  final List<PersonRow> people;
  final PeoplePagination pagination;
  final PeopleFilters filters;
  final bool loading;
  final String? error;

  const PeopleState({
    this.people = const [],
    this.pagination = const PeoplePagination(),
    this.filters = const PeopleFilters(),
    this.loading = false,
    this.error,
  });

  PeopleState copyWith({
    List<PersonRow>? people,
    PeoplePagination? pagination,
    PeopleFilters? filters,
    bool? loading,
    String? error,
  }) {
    return PeopleState(
      people: people ?? this.people,
      pagination: pagination ?? this.pagination,
      filters: filters ?? this.filters,
      loading: loading ?? this.loading,
      error: error,
    );
  }
}

class PeopleNotifier extends StateNotifier<PeopleState> {
  final AnalyticsRemoteDataSource _ds;
  final String level;
  final String locationId;
  final String? locationName;

  PeopleNotifier(this._ds, {
    required this.level,
    required this.locationId,
    this.locationName,
  }) : super(const PeopleState());

  Future<void> loadPage([int page = 1]) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final res = await _ds.getPeople(
        level: level,
        locationId: locationId,
        locationName: locationName,
        page: page,
        limit: 30,
        filters: state.filters,
      );
      state = PeopleState(
        people: res.data,
        pagination: res.pagination,
        filters: state.filters,
        loading: false,
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> applyFilters(PeopleFilters newFilters) async {
    state = state.copyWith(filters: newFilters);
    await loadPage(1);
  }

  Future<void> nextPage() async {
    if (state.pagination.page < state.pagination.totalPages) {
      await loadPage(state.pagination.page + 1);
    }
  }

  Future<void> prevPage() async {
    if (state.pagination.page > 1) {
      await loadPage(state.pagination.page - 1);
    }
  }
}

/// Parameters for the people provider.
typedef PeopleParams = ({String level, String locationId, String? locationName});

final peopleProvider = StateNotifierProvider.autoDispose
    .family<PeopleNotifier, PeopleState, PeopleParams>((ref, params) {
  final ds = ref.watch(analyticsDsProvider);
  return PeopleNotifier(
    ds,
    level: params.level,
    locationId: params.locationId,
    locationName: params.locationName,
  );
});
