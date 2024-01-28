import { apiHandler } from '@/server/index'
import { resSuccess } from "@/utils/index"
import { getEngines } from "@/server/api/index"

export const maxDuration = 300;
export const GET = apiHandler(async () => {
  return resSuccess(await getEngines())
})