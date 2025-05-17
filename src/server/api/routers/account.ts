import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { Prisma } from "prisma/generated/client";

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  // console.log("👉 accountId:", accountId);
  // console.log("👉 userId from ctx:", userId);

  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      accessToken: true,
    },
  });

  if (!account) {
    console.log("❌ Invalid token: accountId doesn't match userId");
    throw new Error("Invalid token");
  }

  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
      },
    });
  }),
  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "sent", "draft"]), // make that an enum to prevent mismatching
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      if (!ctx.auth?.userId) {
        throw new Error("Unauthorized");
      }

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        // filter = inboxFilter(account.id)
        filter.inboxStatus = true;
      } else if (input.tab === "draft") {
        // filter = draftFilter(account.id)
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        // filter = sentFilter(account.id)
        filter.sentStatus = true;
      }
      // return await ctx.db.thread.count({
      //     where: filter
      // })
      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filter,
        },
      });
    }),

  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        // filter = inboxFilter(account.id)
        filter.inboxStatus = true;
      } else if (input.tab === "sent") {
        // filter = sentFilter(account.id)
        filter.sentStatus = true;
      } else if (input.tab === "draft") {
        // filter = draftFilter(account.id)
        filter.draftStatus = true;
      }

      filter.done = {
        equals: input.done,
      };

      return await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              id: true,
              sentAt: true,
            },
          },
        },
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
    }),
});
