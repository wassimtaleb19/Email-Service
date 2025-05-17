import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { Thread } from "@/types"; // ✅ Import your Thread interface

export const threadIdAtom = atom<string | null>(null);

const useThreads = () => {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("email-service-tab", "inbox");
  const [done] = useLocalStorage("email-service-done", false);
  const [threadId, setThreadId] = useAtom(threadIdAtom);

  const {
    data: threads = [],
    isFetching,
    refetch,
  } = api.account.getThreads.useQuery(
    { accountId, tab, done },
    {
      enabled: !!accountId && !!tab,
      refetchInterval: 5000,
    },
  );

  return {
    threads,
    isFetching,
    refetch,
    accountId,
    threadId,
    setThreadId,
    account: accounts?.find((e) => e.id === accountId),
  };
};

export default useThreads;

// NOTE FOR ME :)
// default export → no {}
// Named export → use {}
