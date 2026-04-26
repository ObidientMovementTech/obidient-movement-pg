import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useUser } from './UserContext';
import {
  getBlockedUsers,
  blockUser as blockUserApi,
  unblockUser as unblockUserApi,
} from '../services/blockService';

// ──────────── Types ────────────

interface BlockContextType {
  blockedIds: Set<string>;
  isBlocked: (userId: string) => boolean;
  blockUser: (userId: string, reason?: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  refreshBlocked: () => Promise<void>;
}

const BlockContext = createContext<BlockContextType>({
  blockedIds: new Set(),
  isBlocked: () => false,
  blockUser: async () => {},
  unblockUser: async () => {},
  refreshBlocked: async () => {},
});

// ──────────── Provider ────────────

export function BlockProvider({ children }: { children: ReactNode }) {
  const { profile } = useUser();
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  const refreshBlocked = useCallback(async () => {
    try {
      const data = await getBlockedUsers(1, 500);
      setBlockedIds(new Set(data.blocked.map((u) => u.id)));
    } catch {
      // Silently fail — block list unavailable
    }
  }, []);

  // Fetch on auth
  useEffect(() => {
    if (profile?._id) {
      refreshBlocked();
    } else {
      setBlockedIds(new Set());
    }
  }, [profile?._id, refreshBlocked]);

  const isBlocked = useCallback(
    (userId: string) => blockedIds.has(userId),
    [blockedIds]
  );

  const blockUser = useCallback(
    async (userId: string, reason?: string) => {
      await blockUserApi(userId, reason);
      setBlockedIds((prev) => new Set(prev).add(userId));
    },
    []
  );

  const unblockUser = useCallback(
    async (userId: string) => {
      await unblockUserApi(userId);
      setBlockedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    },
    []
  );

  return (
    <BlockContext.Provider
      value={{ blockedIds, isBlocked, blockUser, unblockUser, refreshBlocked }}
    >
      {children}
    </BlockContext.Provider>
  );
}

// ──────────── Hook ────────────

export function useBlock() {
  return useContext(BlockContext);
}
