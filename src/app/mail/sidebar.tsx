"use client";

import React from "react";
import { Nav } from "./nav";
import { File, Inbox, Send } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";

type Props = {
  isCollapsed: boolean;
};

const SideBar = ({ isCollapsed }: Props) => {
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<"inbox" | "draft" | "sent">(
    "email-service-tab",
    "inbox",
  );

  const { data: inboxCount } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "inbox",
  });

  const { data: draftCount } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "draft",
  });

  const { data: sentCount } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "sent",
  });

  return (
    <>
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Inbox",
            label: inboxCount?.toString() ?? "0",
            icon: Inbox,
            variant: tab === "inbox" ? "default" : "ghost",
          },
          {
            title: "Draft",
            label: draftCount?.toString() ?? "0",
            icon: File,
            variant: tab === "draft" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: sentCount?.toString() ?? "0",
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost",
          },
        ]}
      />
      <div className="pl-3 pt-2 text-xs text-muted-foreground">{accountId}</div>
    </>
  );
};

export default SideBar;
