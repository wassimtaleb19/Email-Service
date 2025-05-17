'use client'
import React from 'react'
import { Nav } from './nav'
import {
//     AlertCircle,
//     Archive,
//     ArchiveX,
    File,
    Inbox,
//     MessagesSquare,
    Send,
//     ShoppingCart,
//     Trash2,
//     Users2,
} from "lucide-react"
// import { usePathname } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { api } from '@/trpc/react'

type Props = {
     isCollapsed: boolean 
}

const SideBar = ({ isCollapsed }: Props) => {
const [ accountId ] = useLocalStorage('accountId', '')
const [tab] = useLocalStorage<'inbox' | 'draft' | 'sent'>("email-service-tab", "inbox")
// const refetchInterval = 5000
// console.log("accountId:", accountId)
// console.log("tab:", tab)

const { data: inboxThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "inbox"
})

const { data: draftThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "draft" // ✅ keep this plural if backend uses plural
})

const { data: sentThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "sent"
})

return (
         <>
             <Nav
              isCollapsed={isCollapsed}
                links={[
                    {
                        title: "Inbox",
                        label: inboxThreads?.toString() || "0",
                        icon: Inbox,
                        variant: tab === "inbox" ? "default" : "ghost",
                    },
                    {
                        title: "Draft",
                        label: draftThreads?.toString() || "0",
                        icon: File,
                        variant: tab === "draft" ? "default" : "ghost",
                    },
                    {
                        title: "Sent",
                        label: sentThreads?.toString() || "0",
                        icon: Send,
                        variant: tab === "sent" ? "default" : "ghost",
                    },
                ]}

            /> 
            <div className="">{accountId}</div>
         </>
    )
}
export default SideBar