import joi from 'joi'
import { apiHandler, getImageData } from '@/server/index'
import { resSuccess } from "@/utils/index"
import { img2img } from "@/server/api/index"


export const maxDuration = 300;
export const POST = apiHandler(async (req) => {
  const body = await req.json();
  let { engine, prompt, weight, images, ...other } = body;
  engine = engine || 'stable-diffusion-512-v2-1'
  let textPrompt = {
    text: prompt,
    ...weight ? { weight } : {}
  }
  let data = {
    engine,
    text_prompts: [textPrompt],
    ...other
  }
  let result = (await Promise.all(images.map((img: string) => {
    return img2img({ ...data, init_image: img })
  }))).map((item: any) => {
    return item.artifacts?.[0]
  })

  return resSuccess(getImageData(result, engine, prompt))

}, {
  schema: joi.object({
    engine: joi.string().required(),
    prompt: joi.string().required(),
    images: joi.array().required().min(1)
  })
})