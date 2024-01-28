import joi from 'joi'
import { apiHandler, getImageData } from '@/server/index'
import { resSuccess } from "@/utils/index"
import { text2img } from "@/server/api/index"


export const maxDuration = 300;
export const POST = apiHandler(async (req) => {
  const body = await req.json();
  let { engine, prompt, weight, ...other } = body;
  engine = engine || 'stable-diffusion-512-v2-1'
  // engine = engine || 'stable-diffusion-v1-6'
  let textPrompt = {
    text: prompt,
    ...weight ? { weight } : {}
  }
  let data = {
    engine,
    text_prompts: [textPrompt],
    ...other
  }
  let result = getImageData((await text2img(data)).artifacts, engine, prompt);
  return resSuccess(result)
}, {
  schema: joi.object({
    engine: joi.string().required(),
    prompt: joi.string().required()
  })
})