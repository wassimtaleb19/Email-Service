import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { EmailAddress, Prisma, Thread } from "prisma/generated/client";
import { EmailMessage } from "@/types";

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

  /* ─────────────  getThreads  (infinite scroll)  ───────────── */
  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
        cursor: z.string().optional(),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // these are for testing:)
      // console.log("typeof input.accountId", typeof input.accountId); // Should be string
      // console.log("typeof ctx.auth.userId", typeof ctx.auth.userId); // Should be string

      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {
        accountId: account.id,
        done: input.done,
      };
      if (input.tab === "inbox") filter.inboxStatus = true;
      else if (input.tab === "sent") filter.sentStatus = true;
      else if (input.tab === "draft") filter.draftStatus = true;

      const rows = await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              id: true,
              subject: true,
              sentAt: true,
              sysLabels: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              from: { select: { name: true, address: true, raw: true } },
            },
          },
        },
        orderBy: { lastMessageDate: "desc" },
        take: input.limit,
        ...(input.cursor ? { skip: 1, cursor: { id: input.cursor } } : {}),
      });

      const threads: (Thread & { emails: EmailMessage[] })[] = rows.map(
        (t) => ({
          id: t.id,
          subject: t.subject,
          lastMessageDate: t.lastMessageDate ?? new Date(),
          participantIds: t.participantIds,
          accountId: t.accountId,
          done: t.done,
          inboxStatus: t.inboxStatus,
          draftStatus: t.draftStatus,
          sentStatus: t.sentStatus,
          emails: t.emails.map((m: any) => ({
            id: m.id,
            threadId: t.id,
            subject: m.subject,
            sentAt: m.sentAt ? m.sentAt.toISOString() : "",
            sysLabels: (m.sysLabels ?? []) as EmailMessage["sysLabels"],
            body: m.body ?? "",
            bodySnippet: m.bodySnippet ?? "",
            from: m.from as EmailAddress,
            createdTime: m.sentAt ? m.sentAt.toISOString() : "",
            lastModifiedTime: m.sentAt ? m.sentAt.toISOString() : "",
            receivedAt: m.sentAt ? m.sentAt.toISOString() : "",
            internetMessageId: "",
            keywords: [],
            sysClassifications: [],
            sensitivity: "normal",
            meetingMessageMethod: undefined,
            to: [],
            cc: [],
            bcc: [],
            replyTo: [],
            hasAttachments: false,
            attachments: [],
            inReplyTo: undefined,
            references: undefined,
            threadIndex: undefined,
            internetHeaders: [],
            nativeProperties: {},
            folderId: undefined,
            omitted: [],
          })) as EmailMessage[],
        }),
      );

      const nextCursor =
        threads.length === input.limit ? (threads.at(-1)?.id ?? null) : null;

      return { threads, nextCursor };
    }),
});
