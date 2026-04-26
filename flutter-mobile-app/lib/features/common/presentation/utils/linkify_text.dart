import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Regex matches http(s) and www. URLs (trailing punctuation stripped).
final RegExp _urlRegex = RegExp(
  r'((https?:\/\/|www\.)[^\s<]+[^\s<.,!?;:)\]}"\x27])',
  caseSensitive: false,
);

/// Builds a RichText spans list that makes URLs tappable, opening
/// them in the in-app WebView route.
///
/// Usage:
/// ```dart
/// Text.rich(TextSpan(children: buildLinkifiedSpans(context, message, style)))
/// ```
List<InlineSpan> buildLinkifiedSpans(
  BuildContext context,
  String text, {
  required TextStyle baseStyle,
  Color? linkColor,
}) {
  final spans = <InlineSpan>[];
  final lc = linkColor ?? Theme.of(context).primaryColor;
  int last = 0;
  for (final m in _urlRegex.allMatches(text)) {
    if (m.start > last) {
      spans.add(TextSpan(
        text: text.substring(last, m.start),
        style: baseStyle,
      ));
    }
    final raw = m.group(0)!;
    final url = raw.startsWith('http') ? raw : 'https://$raw';
    spans.add(TextSpan(
      text: raw,
      style: baseStyle.copyWith(
        color: lc,
        decoration: TextDecoration.underline,
        decorationColor: lc,
      ),
      recognizer: TapGestureRecognizer()
        ..onTap = () {
          GoRouter.of(context).push(
            '/webview?url=${Uri.encodeComponent(url)}',
          );
        },
    ));
    last = m.end;
  }
  if (last < text.length) {
    spans.add(TextSpan(text: text.substring(last), style: baseStyle));
  }
  return spans;
}
