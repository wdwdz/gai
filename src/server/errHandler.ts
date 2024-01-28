import { NextResponse } from 'next/server'
import { resError } from '@/utils/index'

export const enum ERROR {
  token,
  valid,
  server
}
export function errorHandler(err: string | { name: ERROR, message: string }) {
  if (typeof err === 'string') {
    // custom application error
    const is404 = err.toLowerCase().endsWith('not found')
    const status = is404 ? 404 : 400
    return NextResponse.json(
      resError(status, err),
      { status }
    )
  }

  if (err.name === ERROR.token) {
    // jwt error - delete cookie to auto logout
    return NextResponse.json(
      resError(401, err.message),
      { status: 401 }
    )
  }

  if (err.name === ERROR.valid) {
    return NextResponse.json(
      resError(402, err.message),
      { status: 402 }
    )
  }

  return NextResponse.json(
    resError(500, [err.name ?? false, err.message].filter(Boolean).join(":")),
    { status: 500 }
  )
}

