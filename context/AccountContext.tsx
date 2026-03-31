import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Account, AppwriteException, Models } from "react-native-appwrite";

import { client } from "@/lib/appwrite/client";

interface AccountContextValue {
  account: Models.User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  createAnonymousSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const ACCOUNT_QUERY_KEY = ["account"] as const;

const accountClient = new Account(client);

async function getCurrentAccount() {
  try {
    return await accountClient.get();
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 401) {
      return null;
    }

    throw error;
  }
}

const useAccountContext = () => {
  const queryClient = useQueryClient();

  const { data: account, isLoading: isAccountLoading } = useQuery({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: getCurrentAccount,
    retry: false,
  });

  const createAnonymousSessionMutation = useMutation({
    mutationFn: async () => {
      await accountClient.createAnonymousSession();
      return getCurrentAccount();
    },
    onSuccess: (nextAccount) => {
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, nextAccount);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await accountClient.deleteSession("current");
    },
    onSuccess: () => {
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, null);
    },
  });

  const createAnonymousSession = useCallback(async () => {
    await createAnonymousSessionMutation.mutateAsync();
  }, [createAnonymousSessionMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return useMemo(
    () => ({
      account: account ?? null,
      isLoading:
        isAccountLoading ||
        createAnonymousSessionMutation.isPending ||
        logoutMutation.isPending,
      isLoggedIn: Boolean(account),
      createAnonymousSession,
      logout,
    }),
    [
      account,
      createAnonymousSession,
      createAnonymousSessionMutation.isPending,
      isAccountLoading,
      logout,
      logoutMutation.isPending,
    ]
  );
};

export const [AccountContext, useAccount] =
  createContextHook<AccountContextValue>(useAccountContext);
export const AccountProvider = AccountContext;
