"use client";

import { format, formatDistanceToNow } from "date-fns";
import useThreads from "@/hooks/use-threads";
import React, { ComponentProps, useRef } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ThreadList() {
  const {
    threads,
    threadId,
    setThreadId,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useThreads();

  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll handler
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || isFetchingNextPage || !hasNextPage) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 100) {
      fetchNextPage();
    }
  };

  // Group threads by date
  const groupedThreads = React.useMemo(() => {
    return threads.reduce(
      (acc, thread) => {
        const lastEmail = thread.emails?.length
          ? thread.emails[thread.emails.length - 1]
          : undefined;
        const sentAt = new Date(lastEmail?.sentAt ?? Date.now());
        const localDate = new Date(
          sentAt.getTime() - sentAt.getTimezoneOffset() * 60000,
        );
        const date = format(localDate, "yyyy-MM-dd");
        if (!acc[date]) acc[date] = [];
        acc[date].push(thread);
        return acc;
      },
      {} as Record<string, typeof threads extends (infer U)[] ? U[] : never>,
    );
  }, [threads]);

  return (
    <div
      ref={containerRef}
      className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll"
      onScroll={handleScroll}
    >
      <div className="flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="mt-4 text-xs font-medium text-muted-foreground first:mt-0">
              {date}
            </div>
            {threads.map((thread) => {
              const lastEmail = thread.emails?.length
                ? thread.emails[thread.emails.length - 1]
                : undefined;
              return (
                <button
                  onClick={() => setThreadId(thread.id)}
                  key={thread.id}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                    { "bg-accent": thread.id === threadId },
                  )}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">
                          {lastEmail?.from?.name ??
                            lastEmail?.from?.address ??
                            "Unknown"}
                        </div>
                      </div>
                      <div className="ml-auto text-xs">
                        {formatDistanceToNow(
                          new Date(lastEmail?.sentAt ?? Date.now()),
                          { addSuffix: true },
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-medium">{thread.subject}</div>
                  </div>
                  <div
                    className="line-clamp-2 text-xs text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(lastEmail?.bodySnippet ?? "", {
                        USE_PROFILES: { html: true },
                      }),
                    }}
                  />
                  {!!thread.emails[0]?.sysLabels?.length && (
                    <div className="flex items-center gap-2">
                      {thread.emails[0].sysLabels.map((label: string) => (
                        <Badge
                          key={label}
                          variant={getBadgeVariantFromLabel(label)}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
        {isFetchingNextPage && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Loading more threads…
          </div>
        )}
        {!hasNextPage && threads.length > 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            No more threads
          </div>
        )}
        {isLoading && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }
  return "secondary";
}

export default ThreadList;
