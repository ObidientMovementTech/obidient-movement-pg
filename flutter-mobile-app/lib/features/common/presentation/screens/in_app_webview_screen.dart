import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../core/theme/app_colors.dart';

/// In-app WebView for opening external URLs without leaving the app.
class InAppWebViewScreen extends StatefulWidget {
  final String url;
  final String? title;
  const InAppWebViewScreen({super.key, required this.url, this.title});

  @override
  State<InAppWebViewScreen> createState() => _InAppWebViewScreenState();
}

class _InAppWebViewScreenState extends State<InAppWebViewScreen> {
  late final WebViewController _controller;
  double _progress = 0;
  String? _pageTitle;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (p) => setState(() => _progress = p / 100.0),
          onPageFinished: (_) async {
            final t = await _controller.getTitle();
            if (mounted) setState(() => _pageTitle = t);
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () {
            HapticFeedback.lightImpact();
            Navigator.of(context).pop();
          },
        ),
        title: Text(
          widget.title ?? _pageTitle ?? 'Loading…',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 20),
            onPressed: () {
              HapticFeedback.lightImpact();
              _controller.reload();
            },
          ),
        ],
        bottom: _progress < 1.0
            ? PreferredSize(
                preferredSize: const Size.fromHeight(2),
                child: LinearProgressIndicator(
                  value: _progress,
                  backgroundColor: Colors.transparent,
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppColors.primary),
                  minHeight: 2,
                ),
              )
            : null,
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
