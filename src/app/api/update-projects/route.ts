import { NextResponse, NextRequest } from 'next/server'
import { resSuccess, resError } from "@/utils/index"

export const maxDuration = 300;
export async function POST(res: NextRequest) {
  return NextResponse.json(resSuccess([]))
}