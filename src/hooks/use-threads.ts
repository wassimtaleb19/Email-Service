import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import type { Thread, GetThreadsResult } from "@/types";
import type { InfiniteData } from "@tanstack/react-query";

export const threadIdAtom = atom<string | null>(null);

const useThreads = () => {
  const { data: accounts } = api.account.getAccounts.useQuery();

  /* local-storage state */
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<"inbox" | "sent" | "draft">(
    "email-service-tab",
    "inbox",
  );
  const [done] = useLocalStorage("email-service-done", false);
  const [threadId, setThreadId] = useAtom(threadIdAtom);

  /* infinite query */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.account.getThreads.useInfiniteQuery(
      { accountId, tab, done, limit: 20 },
      {
        enabled: !!accountId && !!tab,
        getNextPageParam: (last) => last.nextCursor,
      },
    );

  /* flatten pages */
  const pages = data as InfiniteData<GetThreadsResult> | undefined;
  const threads: Thread[] = pages?.pages.flatMap((p) => p.threads) ?? [];

  return {
    threads,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    threadId,
    setThreadId,
    accountId,
    account: accounts?.find((a) => a.id === accountId),
  };
};

export default useThreads;
