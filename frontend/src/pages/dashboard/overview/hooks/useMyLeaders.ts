import { useState, useEffect } from 'react';
import { getChatContacts, type ChatContact } from '../../../../services/conversationService';

export function useMyLeaders() {
  const [leaders, setLeaders] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getChatContacts()
      .then((data) => {
        if (cancelled) return;
        // Order: National → State → LGA → Ward (highest rank first)
        const levelOrder: Record<string, number> = { national: 0, state: 1, lga: 2, ward: 3 };
        const sorted = [...(data.coordinators || [])].sort(
          (a, b) => (levelOrder[a.level || ''] ?? 99) - (levelOrder[b.level || ''] ?? 99)
        );
        setLeaders(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || 'Failed to load leaders');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { leaders, loading, error };
}
