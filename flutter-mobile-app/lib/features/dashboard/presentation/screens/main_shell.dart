import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../chat/presentation/providers/chat_providers.dart';

/// Main app shell with bottom navigation bar.
class MainShell extends ConsumerWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/feeds')) return 1;
    if (location.startsWith('/chat')) return 2;
    if (location.startsWith('/blocs')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home');
      case 1:
        context.go('/feeds');
      case 2:
        context.go('/chat');
      case 3:
        context.go('/blocs');
      case 4:
        context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final idx = _currentIndex(context);
    final chatUnread = ref.watch(chatUnreadCountProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: Theme.of(context).colorScheme.outline,
              width: 0.5,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: idx,
          onTap: (i) => _onTap(context, i),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.article_rounded),
              label: 'Feeds',
            ),
            BottomNavigationBarItem(
              icon: chatUnread > 0
                  ? Badge(
                      label: Text(
                        chatUnread > 99 ? '99+' : '$chatUnread',
                        style: const TextStyle(fontSize: 10, color: Colors.white),
                      ),
                      backgroundColor: Colors.red,
                      child: const Icon(Icons.forum_rounded),
                    )
                  : const Icon(Icons.forum_rounded),
              label: 'Chat',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.groups_rounded),
              label: 'My Bloc',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
