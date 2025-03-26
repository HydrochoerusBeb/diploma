"use server"
import { decrypt, deleteSession } from '@/lib/session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
 

export async function logout() {
  deleteSession()
  redirect('/login')
}


export async function getSession() {
  const cookie = (await cookies()).get('session')?.value
  const data = decrypt(cookie)
  return data
}