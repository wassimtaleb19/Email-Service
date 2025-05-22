"use client";

import React from "react";
import useThreads from "@/hooks/use-threads";
import { Archive, ArchiveX, Trash2, Clock, MoreVertical, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import EmailDisplay from "./email-display";
import ReplyBox from "./reply-box";

const ThreadDisplay = () => {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);

  //   return (
  //     <div className="">
  //       {threadId}
  //        -----------
  //       {thread?.subject}
  //     </div>
  //   );

  return (
    <div className="flex h-full flex-col">
      {/* buttons row */}
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <Archive className="size-4" />
          </Button>
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <ArchiveX className="size-4" />
          </Button>
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <Trash2 className="size-4" />
          </Button>
        </div>
        <Separator orientation="vertical" className="ml-2" />
        <Button variant={"ghost"} size="icon" disabled={!thread}>
          <Clock className="size-4" />
        </Button>
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="ml-2"
                variant={"ghost"}
                size="icon"
                disabled={!thread}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* profile-reply-to row */}
      {thread ? (
        <>
          <div className="flex flex-1 flex-col overflow-scroll scrollbar-hide">
            <div className="flex items-center p-4">
              <div className="flex items-center gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt="avatar" />
                  <AvatarFallback>
                    {thread.emails[0]?.from?.name
                      ?.split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="grid gap-1">
                  <div className="font-semibold">
                    {thread.emails[0]?.from?.name}
                    <div className="line-clamp-1 text-xs">
                      {thread.emails[0]?.subject}
                    </div>
                  </div>
                  <div className="line-clamp-1 text-xs">
                    <span className="font-medium">Reply-To:</span>{" "}
                    {thread.emails[0]?.from?.address}
                  </div>
                </div>
              </div>

              {thread.emails[0]?.sentAt && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(thread.emails[0]?.sentAt), "PPpp")}
                </div>
              )}
            </div>
            <Separator />
            <div className="flex max-h-[calc(100vh-500px)] flex-col overflow-scroll scrollbar-hide">
              <div className="flex flex-col gap-4 p-6">
                {thread.emails.map((email) => {
                  return <EmailDisplay key={email.id} email={email} />;
                })}
              </div>
            </div>
            <div className="flex-1"></div>
            <Separator className="mt-auto" />
            {/* Reply Box */}
            <ReplyBox />
          </div>
        </>
      ) : (
        <>
          <div className="p-8 text-center text-muted-foreground">
            No message selected
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;
