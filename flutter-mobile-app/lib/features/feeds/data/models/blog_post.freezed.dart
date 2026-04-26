// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'blog_post.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

BlogPost _$BlogPostFromJson(Map<String, dynamic> json) {
  return _BlogPost.fromJson(json);
}

/// @nodoc
mixin _$BlogPost {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get slug => throw _privateConstructorUsedError;
  String? get content => throw _privateConstructorUsedError;
  String? get excerpt => throw _privateConstructorUsedError;
  @JsonKey(name: 'featured_image_url')
  String? get featuredImageUrl => throw _privateConstructorUsedError;
  @JsonKey(name: 'author_id')
  String? get authorId => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String get category => throw _privateConstructorUsedError;
  List<String> get tags => throw _privateConstructorUsedError;
  @JsonKey(name: 'published_at')
  String? get publishedAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  String? get updatedAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'author_name')
  String? get authorName => throw _privateConstructorUsedError;
  @JsonKey(name: 'author_image')
  String? get authorImage => throw _privateConstructorUsedError;
  ReactionCounts? get reactions => throw _privateConstructorUsedError;
  String? get userReaction => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $BlogPostCopyWith<BlogPost> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BlogPostCopyWith<$Res> {
  factory $BlogPostCopyWith(BlogPost value, $Res Function(BlogPost) then) =
      _$BlogPostCopyWithImpl<$Res, BlogPost>;
  @useResult
  $Res call(
      {String id,
      String title,
      String slug,
      String? content,
      String? excerpt,
      @JsonKey(name: 'featured_image_url') String? featuredImageUrl,
      @JsonKey(name: 'author_id') String? authorId,
      String status,
      String category,
      List<String> tags,
      @JsonKey(name: 'published_at') String? publishedAt,
      @JsonKey(name: 'created_at') String? createdAt,
      @JsonKey(name: 'updated_at') String? updatedAt,
      @JsonKey(name: 'author_name') String? authorName,
      @JsonKey(name: 'author_image') String? authorImage,
      ReactionCounts? reactions,
      String? userReaction});

  $ReactionCountsCopyWith<$Res>? get reactions;
}

/// @nodoc
class _$BlogPostCopyWithImpl<$Res, $Val extends BlogPost>
    implements $BlogPostCopyWith<$Res> {
  _$BlogPostCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? content = freezed,
    Object? excerpt = freezed,
    Object? featuredImageUrl = freezed,
    Object? authorId = freezed,
    Object? status = null,
    Object? category = null,
    Object? tags = null,
    Object? publishedAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? authorName = freezed,
    Object? authorImage = freezed,
    Object? reactions = freezed,
    Object? userReaction = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      slug: null == slug
          ? _value.slug
          : slug // ignore: cast_nullable_to_non_nullable
              as String,
      content: freezed == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String?,
      excerpt: freezed == excerpt
          ? _value.excerpt
          : excerpt // ignore: cast_nullable_to_non_nullable
              as String?,
      featuredImageUrl: freezed == featuredImageUrl
          ? _value.featuredImageUrl
          : featuredImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      authorId: freezed == authorId
          ? _value.authorId
          : authorId // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _value.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      tags: null == tags
          ? _value.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      authorName: freezed == authorName
          ? _value.authorName
          : authorName // ignore: cast_nullable_to_non_nullable
              as String?,
      authorImage: freezed == authorImage
          ? _value.authorImage
          : authorImage // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: freezed == reactions
          ? _value.reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as ReactionCounts?,
      userReaction: freezed == userReaction
          ? _value.userReaction
          : userReaction // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $ReactionCountsCopyWith<$Res>? get reactions {
    if (_value.reactions == null) {
      return null;
    }

    return $ReactionCountsCopyWith<$Res>(_value.reactions!, (value) {
      return _then(_value.copyWith(reactions: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$BlogPostImplCopyWith<$Res>
    implements $BlogPostCopyWith<$Res> {
  factory _$$BlogPostImplCopyWith(
          _$BlogPostImpl value, $Res Function(_$BlogPostImpl) then) =
      __$$BlogPostImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String title,
      String slug,
      String? content,
      String? excerpt,
      @JsonKey(name: 'featured_image_url') String? featuredImageUrl,
      @JsonKey(name: 'author_id') String? authorId,
      String status,
      String category,
      List<String> tags,
      @JsonKey(name: 'published_at') String? publishedAt,
      @JsonKey(name: 'created_at') String? createdAt,
      @JsonKey(name: 'updated_at') String? updatedAt,
      @JsonKey(name: 'author_name') String? authorName,
      @JsonKey(name: 'author_image') String? authorImage,
      ReactionCounts? reactions,
      String? userReaction});

  @override
  $ReactionCountsCopyWith<$Res>? get reactions;
}

/// @nodoc
class __$$BlogPostImplCopyWithImpl<$Res>
    extends _$BlogPostCopyWithImpl<$Res, _$BlogPostImpl>
    implements _$$BlogPostImplCopyWith<$Res> {
  __$$BlogPostImplCopyWithImpl(
      _$BlogPostImpl _value, $Res Function(_$BlogPostImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? content = freezed,
    Object? excerpt = freezed,
    Object? featuredImageUrl = freezed,
    Object? authorId = freezed,
    Object? status = null,
    Object? category = null,
    Object? tags = null,
    Object? publishedAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? authorName = freezed,
    Object? authorImage = freezed,
    Object? reactions = freezed,
    Object? userReaction = freezed,
  }) {
    return _then(_$BlogPostImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      slug: null == slug
          ? _value.slug
          : slug // ignore: cast_nullable_to_non_nullable
              as String,
      content: freezed == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String?,
      excerpt: freezed == excerpt
          ? _value.excerpt
          : excerpt // ignore: cast_nullable_to_non_nullable
              as String?,
      featuredImageUrl: freezed == featuredImageUrl
          ? _value.featuredImageUrl
          : featuredImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      authorId: freezed == authorId
          ? _value.authorId
          : authorId // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _value.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      tags: null == tags
          ? _value._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      authorName: freezed == authorName
          ? _value.authorName
          : authorName // ignore: cast_nullable_to_non_nullable
              as String?,
      authorImage: freezed == authorImage
          ? _value.authorImage
          : authorImage // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: freezed == reactions
          ? _value.reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as ReactionCounts?,
      userReaction: freezed == userReaction
          ? _value.userReaction
          : userReaction // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BlogPostImpl implements _BlogPost {
  const _$BlogPostImpl(
      {required this.id,
      required this.title,
      required this.slug,
      this.content,
      this.excerpt,
      @JsonKey(name: 'featured_image_url') this.featuredImageUrl,
      @JsonKey(name: 'author_id') this.authorId,
      this.status = 'published',
      this.category = 'National Updates',
      final List<String> tags = const [],
      @JsonKey(name: 'published_at') this.publishedAt,
      @JsonKey(name: 'created_at') this.createdAt,
      @JsonKey(name: 'updated_at') this.updatedAt,
      @JsonKey(name: 'author_name') this.authorName,
      @JsonKey(name: 'author_image') this.authorImage,
      this.reactions,
      this.userReaction})
      : _tags = tags;

  factory _$BlogPostImpl.fromJson(Map<String, dynamic> json) =>
      _$$BlogPostImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String slug;
  @override
  final String? content;
  @override
  final String? excerpt;
  @override
  @JsonKey(name: 'featured_image_url')
  final String? featuredImageUrl;
  @override
  @JsonKey(name: 'author_id')
  final String? authorId;
  @override
  @JsonKey()
  final String status;
  @override
  @JsonKey()
  final String category;
  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  @override
  @JsonKey(name: 'published_at')
  final String? publishedAt;
  @override
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final String? updatedAt;
  @override
  @JsonKey(name: 'author_name')
  final String? authorName;
  @override
  @JsonKey(name: 'author_image')
  final String? authorImage;
  @override
  final ReactionCounts? reactions;
  @override
  final String? userReaction;

  @override
  String toString() {
    return 'BlogPost(id: $id, title: $title, slug: $slug, content: $content, excerpt: $excerpt, featuredImageUrl: $featuredImageUrl, authorId: $authorId, status: $status, category: $category, tags: $tags, publishedAt: $publishedAt, createdAt: $createdAt, updatedAt: $updatedAt, authorName: $authorName, authorImage: $authorImage, reactions: $reactions, userReaction: $userReaction)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BlogPostImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.excerpt, excerpt) || other.excerpt == excerpt) &&
            (identical(other.featuredImageUrl, featuredImageUrl) ||
                other.featuredImageUrl == featuredImageUrl) &&
            (identical(other.authorId, authorId) ||
                other.authorId == authorId) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.category, category) ||
                other.category == category) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.publishedAt, publishedAt) ||
                other.publishedAt == publishedAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.authorName, authorName) ||
                other.authorName == authorName) &&
            (identical(other.authorImage, authorImage) ||
                other.authorImage == authorImage) &&
            (identical(other.reactions, reactions) ||
                other.reactions == reactions) &&
            (identical(other.userReaction, userReaction) ||
                other.userReaction == userReaction));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      title,
      slug,
      content,
      excerpt,
      featuredImageUrl,
      authorId,
      status,
      category,
      const DeepCollectionEquality().hash(_tags),
      publishedAt,
      createdAt,
      updatedAt,
      authorName,
      authorImage,
      reactions,
      userReaction);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$BlogPostImplCopyWith<_$BlogPostImpl> get copyWith =>
      __$$BlogPostImplCopyWithImpl<_$BlogPostImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BlogPostImplToJson(
      this,
    );
  }
}

abstract class _BlogPost implements BlogPost {
  const factory _BlogPost(
      {required final String id,
      required final String title,
      required final String slug,
      final String? content,
      final String? excerpt,
      @JsonKey(name: 'featured_image_url') final String? featuredImageUrl,
      @JsonKey(name: 'author_id') final String? authorId,
      final String status,
      final String category,
      final List<String> tags,
      @JsonKey(name: 'published_at') final String? publishedAt,
      @JsonKey(name: 'created_at') final String? createdAt,
      @JsonKey(name: 'updated_at') final String? updatedAt,
      @JsonKey(name: 'author_name') final String? authorName,
      @JsonKey(name: 'author_image') final String? authorImage,
      final ReactionCounts? reactions,
      final String? userReaction}) = _$BlogPostImpl;

  factory _BlogPost.fromJson(Map<String, dynamic> json) =
      _$BlogPostImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get slug;
  @override
  String? get content;
  @override
  String? get excerpt;
  @override
  @JsonKey(name: 'featured_image_url')
  String? get featuredImageUrl;
  @override
  @JsonKey(name: 'author_id')
  String? get authorId;
  @override
  String get status;
  @override
  String get category;
  @override
  List<String> get tags;
  @override
  @JsonKey(name: 'published_at')
  String? get publishedAt;
  @override
  @JsonKey(name: 'created_at')
  String? get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  String? get updatedAt;
  @override
  @JsonKey(name: 'author_name')
  String? get authorName;
  @override
  @JsonKey(name: 'author_image')
  String? get authorImage;
  @override
  ReactionCounts? get reactions;
  @override
  String? get userReaction;
  @override
  @JsonKey(ignore: true)
  _$$BlogPostImplCopyWith<_$BlogPostImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
