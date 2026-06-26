// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'analytics_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DemographicsKpisImpl _$$DemographicsKpisImplFromJson(
        Map<String, dynamic> json) =>
    _$DemographicsKpisImpl(
      total: (json['total'] as num?)?.toInt() ?? 0,
      hasPvc: (json['hasPvc'] as num?)?.toInt() ?? 0,
      noPvc: (json['noPvc'] as num?)?.toInt() ?? 0,
      willVote: (json['willVote'] as num?)?.toInt() ?? 0,
      profileComplete: (json['profileComplete'] as num?)?.toInt() ?? 0,
      active30d: (json['active30d'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$DemographicsKpisImplToJson(
        _$DemographicsKpisImpl instance) =>
    <String, dynamic>{
      'total': instance.total,
      'hasPvc': instance.hasPvc,
      'noPvc': instance.noPvc,
      'willVote': instance.willVote,
      'profileComplete': instance.profileComplete,
      'active30d': instance.active30d,
    };

_$GenderBreakdownImpl _$$GenderBreakdownImplFromJson(
        Map<String, dynamic> json) =>
    _$GenderBreakdownImpl(
      male: (json['male'] as num?)?.toInt() ?? 0,
      female: (json['female'] as num?)?.toInt() ?? 0,
      unknown: (json['unknown'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$GenderBreakdownImplToJson(
        _$GenderBreakdownImpl instance) =>
    <String, dynamic>{
      'male': instance.male,
      'female': instance.female,
      'unknown': instance.unknown,
    };

_$AgeRangeEntryImpl _$$AgeRangeEntryImplFromJson(Map<String, dynamic> json) =>
    _$AgeRangeEntryImpl(
      label: json['label'] as String,
      count: (json['count'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$AgeRangeEntryImplToJson(_$AgeRangeEntryImpl instance) =>
    <String, dynamic>{
      'label': instance.label,
      'count': instance.count,
    };

_$PvcStatusImpl _$$PvcStatusImplFromJson(Map<String, dynamic> json) =>
    _$PvcStatusImpl(
      yes: (json['yes'] as num?)?.toInt() ?? 0,
      no: (json['no'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$PvcStatusImplToJson(_$PvcStatusImpl instance) =>
    <String, dynamic>{
      'yes': instance.yes,
      'no': instance.no,
    };

_$VotingIntentImpl _$$VotingIntentImplFromJson(Map<String, dynamic> json) =>
    _$VotingIntentImpl(
      yes: (json['yes'] as num?)?.toInt() ?? 0,
      no: (json['no'] as num?)?.toInt() ?? 0,
      unknown: (json['unknown'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$VotingIntentImplToJson(_$VotingIntentImpl instance) =>
    <String, dynamic>{
      'yes': instance.yes,
      'no': instance.no,
      'unknown': instance.unknown,
    };

_$ProfileHealthImpl _$$ProfileHealthImplFromJson(Map<String, dynamic> json) =>
    _$ProfileHealthImpl(
      complete: (json['complete'] as num?)?.toInt() ?? 0,
      high: (json['high'] as num?)?.toInt() ?? 0,
      medium: (json['medium'] as num?)?.toInt() ?? 0,
      low: (json['low'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$ProfileHealthImplToJson(_$ProfileHealthImpl instance) =>
    <String, dynamic>{
      'complete': instance.complete,
      'high': instance.high,
      'medium': instance.medium,
      'low': instance.low,
    };

_$SignupTrendEntryImpl _$$SignupTrendEntryImplFromJson(
        Map<String, dynamic> json) =>
    _$SignupTrendEntryImpl(
      week: json['week'] as String,
      count: (json['count'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$SignupTrendEntryImplToJson(
        _$SignupTrendEntryImpl instance) =>
    <String, dynamic>{
      'week': instance.week,
      'count': instance.count,
    };

_$DemographicsInsightsImpl _$$DemographicsInsightsImplFromJson(
        Map<String, dynamic> json) =>
    _$DemographicsInsightsImpl(
      needsAttention: (json['needsAttention'] as num?)?.toInt() ?? 0,
      ghosts: (json['ghosts'] as num?)?.toInt() ?? 0,
      champions: (json['champions'] as num?)?.toInt() ?? 0,
      noLocation: (json['noLocation'] as num?)?.toInt() ?? 0,
      genderGapAlert: json['genderGapAlert'] as bool? ?? false,
      youthGapAlert: json['youthGapAlert'] as bool? ?? false,
    );

Map<String, dynamic> _$$DemographicsInsightsImplToJson(
        _$DemographicsInsightsImpl instance) =>
    <String, dynamic>{
      'needsAttention': instance.needsAttention,
      'ghosts': instance.ghosts,
      'champions': instance.champions,
      'noLocation': instance.noLocation,
      'genderGapAlert': instance.genderGapAlert,
      'youthGapAlert': instance.youthGapAlert,
    };

_$DemographicsDataImpl _$$DemographicsDataImplFromJson(
        Map<String, dynamic> json) =>
    _$DemographicsDataImpl(
      kpis: DemographicsKpis.fromJson(json['kpis'] as Map<String, dynamic>),
      gender: GenderBreakdown.fromJson(json['gender'] as Map<String, dynamic>),
      ageRanges: (json['ageRanges'] as List<dynamic>?)
              ?.map((e) => AgeRangeEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      pvcStatus: PvcStatus.fromJson(json['pvcStatus'] as Map<String, dynamic>),
      votingIntent:
          VotingIntent.fromJson(json['votingIntent'] as Map<String, dynamic>),
      profileHealth:
          ProfileHealth.fromJson(json['profileHealth'] as Map<String, dynamic>),
      signupTrend: (json['signupTrend'] as List<dynamic>?)
              ?.map((e) => SignupTrendEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      insights: DemographicsInsights.fromJson(
          json['insights'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$DemographicsDataImplToJson(
        _$DemographicsDataImpl instance) =>
    <String, dynamic>{
      'kpis': instance.kpis,
      'gender': instance.gender,
      'ageRanges': instance.ageRanges,
      'pvcStatus': instance.pvcStatus,
      'votingIntent': instance.votingIntent,
      'profileHealth': instance.profileHealth,
      'signupTrend': instance.signupTrend,
      'insights': instance.insights,
    };

_$PersonRowImpl _$$PersonRowImplFromJson(Map<String, dynamic> json) =>
    _$PersonRowImpl(
      id: json['id'] as String,
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      gender: json['gender'] as String?,
      ageRange: json['ageRange'] as String?,
      isVoter: json['isVoter'] as String?,
      willVote: json['willVote'] as String?,
      votingState: json['votingState'] as String?,
      votingLGA: json['votingLGA'] as String?,
      votingWard: json['votingWard'] as String?,
      votingPU: json['votingPU'] as String?,
      profileImage: json['profileImage'] as String?,
      designation: json['designation'] as String?,
      stateOfOrigin: json['stateOfOrigin'] as String?,
      citizenship: json['citizenship'] as String?,
      profileCompletionPercentage:
          (json['profileCompletionPercentage'] as num?)?.toInt() ?? 0,
      lastActive: json['lastActive'] as String?,
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$$PersonRowImplToJson(_$PersonRowImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'phone': instance.phone,
      'email': instance.email,
      'gender': instance.gender,
      'ageRange': instance.ageRange,
      'isVoter': instance.isVoter,
      'willVote': instance.willVote,
      'votingState': instance.votingState,
      'votingLGA': instance.votingLGA,
      'votingWard': instance.votingWard,
      'votingPU': instance.votingPU,
      'profileImage': instance.profileImage,
      'designation': instance.designation,
      'stateOfOrigin': instance.stateOfOrigin,
      'citizenship': instance.citizenship,
      'profileCompletionPercentage': instance.profileCompletionPercentage,
      'lastActive': instance.lastActive,
      'createdAt': instance.createdAt,
    };

_$PeoplePaginationImpl _$$PeoplePaginationImplFromJson(
        Map<String, dynamic> json) =>
    _$PeoplePaginationImpl(
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 30,
      total: (json['total'] as num?)?.toInt() ?? 0,
      totalPages: (json['totalPages'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$PeoplePaginationImplToJson(
        _$PeoplePaginationImpl instance) =>
    <String, dynamic>{
      'page': instance.page,
      'limit': instance.limit,
      'total': instance.total,
      'totalPages': instance.totalPages,
    };

_$PeopleResponseImpl _$$PeopleResponseImplFromJson(Map<String, dynamic> json) =>
    _$PeopleResponseImpl(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => PersonRow.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      pagination:
          PeoplePagination.fromJson(json['pagination'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$PeopleResponseImplToJson(
        _$PeopleResponseImpl instance) =>
    <String, dynamic>{
      'data': instance.data,
      'pagination': instance.pagination,
    };
