// import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/session'
 
const protectedRoutes = ['/testfunc', '/companies', '/company/:id']
const publicRoutes = ['/login', '/signup', '/']
const allowedWithSession = ['/']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route =>
    route.includes(":id") ? path.startsWith(route.replace(":id", "")) : path === route
  );
  const isPublicRoute = publicRoutes.includes(path)
  const isAllowedWithSession = allowedWithSession.includes(path)

  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
  console.log(session);
  
 
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (
    isPublicRoute &&
    session?.id &&
    !isAllowedWithSession &&
    !req.nextUrl.pathname.startsWith('/companies')
  ) {
    return NextResponse.redirect(new URL('/companies', req.nextUrl))
  }
 
  return NextResponse.next()
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}