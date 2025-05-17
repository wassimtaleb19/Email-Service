"use client";

import { format, formatDistanceToNow } from "date-fns";
import useThreads from "@/hooks/use-threads";
import React, { ComponentProps } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ThreadList() {
  const { threads, threadId, setThreadId } = useThreads();

  const groupedThreads = threads?.reduce(
    (acc, thread) => {
      // const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");

      // ✅ FIXED: use local date (not UTC) to prevent wrong grouping
      const sentAt = new Date(thread.emails.at(-1)?.sentAt ?? new Date());
      const localDate = new Date(
        sentAt.getTime() - sentAt.getTimezoneOffset() * 60000,
      );
      const date = format(localDate, "yyyy-MM-dd");

      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    },
    {} as Record<string, typeof threads extends (infer U)[] ? U[] : never>,
  );

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      {/* <div className="flex flex-col gap-2 p-4 pt-0" ref={parent}> */}
      <div className="flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
          return (
            <React.Fragment key={date}>
              <div className="mt-4 text-xs font-medium text-muted-foreground first:mt-0">
                {/* {format(new Date(date), "MMMM d, yyyy")} */}
                {date}
              </div>
              {threads?.map((thread) => {
                return (
                  <button
                    onClick={() => {
                      setThreadId(thread.id);
                    }}
                    // id={`thread-${thread.id}`}
                    key={thread.id}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                      // visualMode && selectedThreadIds.includes(thread.id) && "bg-blue-200 dark:bg-blue-900",
                      { "bg-accent": thread.id === threadId },
                    )}
                  >
                    {/* {threadId === item.id && (
                      <motion.div
                        className="absolute inset-0 z-[-1] rounded-lg bg-black/10 dark:bg-white/20"
                        layoutId="thread-list-item"
                        transition={{
                          duration: 0.1,
                          ease: "easeInOut",
                        }}
                      />
                    )} */}
                    <div className="flex w-full flex-col gap-1">
                      <div className="flex items-center">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">
                            {thread.emails.at(-1)?.from?.name}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "ml-auto text-xs",
                            // threadId === thread.id
                            //   ? "text-foreground"
                            //   : "text-muted-foreground",
                          )}
                        >
                          {formatDistanceToNow(
                            thread.emails.at(-1)?.sentAt ?? new Date(),
                            {
                              addSuffix: true,
                            },
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-medium">
                        {thread.subject}
                      </div>
                    </div>
                    <div
                      className="line-clamp-2 text-xs text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          thread.emails.at(-1)?.bodySnippet ?? "",
                          {
                            USE_PROFILES: { html: true },
                          },
                        ),
                      }}
                    ></div>
                    {thread.emails[0]?.sysLabels.length && (
                      <div className="flex items-center gap-2">
                        {thread.emails.at(0)?.sysLabels.map((label: string) => {
                          return (
                            <Badge
                              key={label}
                              variant={getBadgeVariantFromLabel(label)}
                            >
                              {label}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
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

  //   if (["personal"].includes(label.toLowerCase())) {
  //     return "outline";
  //   }

  return "secondary";
}

export default ThreadList;
