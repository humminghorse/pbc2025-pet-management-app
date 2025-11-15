import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareClient({ req: request, res: response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ログインが必要なページをチェック
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/signup")
  const isProtectedPage = request.nextUrl.pathname.startsWith("/my-pets")

  if (isProtectedPage && !session) {
    // 未ログインでprotectedページにアクセスした場合はログインページへ
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthPage && session) {
    // ログイン済みでauth pageにアクセスした場合はmy-petsへ
    return NextResponse.redirect(new URL("/my-pets", request.url))
  }

  return response
}
