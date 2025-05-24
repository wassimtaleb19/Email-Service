'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Bot } from "lucide-react"
import { Textarea } from '@/components/ui/textarea'
import { generateEmail } from './action'
import { readStreamableValue } from 'ai/rsc'
import useThreads from '@/hooks/use-threads'
import { turndown } from '@/lib/turndown'
// import { Input } from "@/components/ui/input"
// import TurndownService from 'turndown'

type Props = {
    isComposing?: boolean
    onGenerate: (token: string) => void
}

const AIComposeButton = (props: Props) => {
    const [open, setOpen] = React.useState(false)
    const [prompt, setPrompt] = React.useState('')
    const {threads, threadId, account } = useThreads()
    const thread = threads?.find(t => t.id === threadId)
    // const aiGenerate = async (prompt: string) => {
    const aiGenerate = async () => {
        // let context: string | undefined = ''
        let context = ''
        if (!props.isComposing) {
            // context = thread?.emails.map(m => `Subject: ${m.subject}\nFrom: ${m.from.address}\n\n${turndown.turndown(m.body ?? m.bodySnippet ?? '')}`).join('\n')
            // if (props.isComposing) {
                for (const email of thread?.emails ?? []) {
                    const content = `
            Subject: ${email.subject}
            From: ${email.from}
            Sent: ${new Date(email.sentAt).toLocaleString()}
            Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
                    `;
                    context += content;
                }
            // }
            
            context += `
            My name is ${account?.name} and my email is ${account?.emailAddress}.
            `;

            // console.log(context)
            
        }

        // const { output } = await generateEmail(context + `\n\nMy name is: ${account?.name}`, prompt)
        const { output } = await generateEmail(context, prompt)

        for await (const token of readStreamableValue(output)) {
            if (token) {
                props.onGenerate(token);
            }
        }
    }
    return (
        // <Dialog open={open} onOpenChange={setOpen}>
        <Dialog>
            <DialogTrigger>
                <Button onClick={() => setOpen(true)} size='icon' variant={'outline'}>
                    <Bot className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Smart Compose</DialogTitle>
                    <DialogDescription>
                        {/* AI will compose an email based on the context of your previous emails. */}
                        AI will help you compose your email.
                    </DialogDescription>
                    <div className="h-2"></div>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter a prompot."
                        // placeholder="What would you like to compose?"
                    />
                    <div className="h-2"></div>
                    <Button onClick={() => {
                        setOpen(false);
                        setPrompt('')
                        aiGenerate();
                    }}>
                        Generate
                    </Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}

export default AIComposeButton