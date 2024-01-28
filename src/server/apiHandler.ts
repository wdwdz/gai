import { NextRequest, NextResponse } from 'next/server'
import { Schema } from "joi"

import { errorHandler } from './errHandler'
import { validateMiddleware } from './middleware/validate'
import { verifyTokenMiddleware } from "./middleware/token"

function isPublicPath(req: NextRequest) {
  // public routes that don't require authentication
  const publicPaths: string[] = []
  let path = `${req.method}:${req.nextUrl.pathname}`;
  return publicPaths.includes(path)
}

interface IParams {
  schema?: Schema
}
export function apiHandler(handler: (req: NextRequest, ...args: any[]) => any, { schema }: IParams = {}) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      if (!isPublicPath(req)) {
        // global middleware
        // await verifyTokenMiddleware(req)
        await validateMiddleware(req, schema)
      }
      // route handler
      const responseBody = await handler(req, ...args)
      return NextResponse.json(responseBody || {})
    } catch (err) {
      console.log('global error handler::', err)
      return errorHandler(err as string)
    }
  }
}

