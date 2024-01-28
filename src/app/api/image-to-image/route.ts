import joi from 'joi'
import { apiHandler, getImageData } from '@/server/index'
import { resSuccess } from "@/utils/index"
import { img2img } from "@/server/api/index"


export const maxDuration = 300;
export const POST = apiHandler(async (req) => {
  const body = await req.json();
  let { engine, text_prompts, images, ...other } = body;
  engine = engine || 'stable-diffusion-512-v2-1'
  let data = {
    engine,
    text_prompts,
    ...other
  }
  let result = (await Promise.all(images.map((img: string) => {
    return img2img({ ...data, init_image: img })
  }))).map((item: any) => {
    return item.artifacts?.[0]
  })

  return resSuccess(getImageData(result, engine))

}, {
  schema: joi.object({
    engine: joi.string().required(),
    text_prompts: joi.array().required().min(1),
    images: joi.array().required().min(1)
  })
})