"use client";

import React, { useEffect } from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { Plus } from "lucide-react";

interface Props {
  isCollapsed: boolean;
}

export function AccountSwitcher({ isCollapsed }: Props) {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  // ✅ Auto-select the first account if none selected
  useEffect(() => {
    if (!accounts || accounts.length === 0) return;

    const validAccount = accounts.find((acc) => acc.id === accountId);

    if (!validAccount) {
      // 🔥 Reset localStorage if it's pointing to a deleted account
      setAccountId(accounts[0]!.id);
    }
  }, [accounts, accountId, setAccountId]);

  if (!accounts) return null;

  const handleClick = async () => {
    const res = await fetch("/api/aurinko/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceType: "Google" }),
    });

    if (!res.ok) {
      alert("Failed to get auth URL");
      return;
    }

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="flex w-full items-center gap-2">
      <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger
          className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&_svg]:hidden",
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            <span className={cn({ hidden: !isCollapsed })}>
              {accounts.find((acc) => acc.id === accountId)?.emailAddress[0]}
            </span>
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {accounts.find((acc) => acc.id === accountId)?.emailAddress}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.emailAddress}
            </SelectItem>
          ))}
          <div
            onClick={handleClick}
            className="relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-gray-50 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Plus className="mr-1 size-4" />
            Add account
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
