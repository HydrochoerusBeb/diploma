import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './session'
import { cache } from 'react'
import { redirect } from 'next/navigation'
// import { decrypt } from '@/app/lib/session'
 
export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.userId) {
    redirect('/login')
  }
 
  return { isAuth: true, userId: session.userId }
})  


