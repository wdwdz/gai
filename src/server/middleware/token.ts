import { NextRequest } from 'next/server'
import { verifyIdToken } from "@/server/lib/firebase"
export function getToken(res: NextRequest) {
  let header = new Headers(res.headers);
  return (header.get("authorization") ?? '').split("Bearer ")[1]
}


export async function verifyTokenMiddleware(req: NextRequest) {
  try {
    const token = getToken(req);
    await verifyIdToken(token)
    return Promise.resolve(true)
  } catch (error) {
    throw 'Token verification failed, please log in again'
  }
}
