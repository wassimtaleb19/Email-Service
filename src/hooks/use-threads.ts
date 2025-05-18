import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import type { Thread } from "@/types"; // Your frontend Thread type

export const threadIdAtom = atom<string | null>(null);

const useThreads = () => {
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("email-service-tab", "inbox");
  const [done] = useLocalStorage("email-service-done", false);
  const [threadId, setThreadId] = useAtom(threadIdAtom);

  // Infinite query
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.account.getThreads.useInfiniteQuery(
      { accountId, tab, done, limit: 15 },
      {
        enabled: !!accountId && !!tab,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const threads = data?.pages.flatMap((page) => page.threads) ?? [];

  return {
    threads,
    threadId,
    setThreadId,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
};

export default useThreads;
