import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  
  if (!type) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

