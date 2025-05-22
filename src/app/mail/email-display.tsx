"use client";
// tsrafce

import React from 'react'
import { RouterOutputs } from '@/trpc/react';
import useThreads from '@/hooks/use-threads';
import { cn } from '@/lib/utils';
import Avatar from 'react-avatar';
import { formatDistanceToNow } from 'date-fns';
import { Letter } from 'react-letter'

type Props = {
    email: RouterOutputs['account']['getThreads']['threads'][0]['emails'][0]
}

function EmailDisplay({ email }: Props) {
    const { account } = useThreads()

    const isMe = account?.emailAddress === email.from.address
    // to know who sends the email, and if i am the sender

  return (
    <div className={cn('border rounded-md p-4 transition-all hover:translate-x-2', {'border-l-gray-900 border-l-4': isMe})}>
        <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center justify-between gap-2'>
                {!isMe && <Avatar name={email.from.name ?? email.from.address} email={email.from.address} size="35" textSizeRatio={2} round={true} />}
                <span className='font-medium'>
                    {isMe ? 'Me' : email.from.address}
                </span>
            </div>
            <p className='text-xm text-muted-foreground'>
                {formatDistanceToNow(email.sentAt ?? new Date(), { addSuffix: true })}
            </p>
        </div>
        <div className='p-4'>
            <Letter html={email?.body ?? ''} className='bg-white rounded-md text-black' />
        </div>

    </div>
  )
}

export default EmailDisplay