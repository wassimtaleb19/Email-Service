import {auth} from "@clerk/nextjs/server"
import axios from "axios"

export const getAurinkoURL = async (serviceType : 'Google' | 'Office365') => {
    const {userId} = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const params = new URLSearchParams({
        clientId: process.env.NEXT_PUBLIC_AURINKO_CLIENT_ID as string,
        serviceType,
        scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
        responseType: 'code',
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,        
    })

    const url = `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`
    return url
}

export const exchangeCodeForAccessToken = async (code: string) => {
    try {
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {}, {
            auth: {
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string
            }
        })
        return response.data as {
            accountId: number,
            accessToken: string,
            userId: string,
            userSession: string
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("[AURINKO TOKEN ERROR]", {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }    
        console.error(error)
    }
}

export const getAccountDetails = async (accessToken: string) => {
    try {
        const response = await axios.get('https://api.aurinko.io/v1/account', {
            headers: {
                'Authorization' : `Bearer ${accessToken}`
            }
        })
        return response.data as {
            email: string,
            name: string
        }
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.error('Error fetching account details:', error.response?.data);    
        }
        else{
            console.error('Unexpected error fetching account details:', error);    
        }
        throw error;
    }
}