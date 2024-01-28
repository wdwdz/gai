import joi from 'joi'
import { apiHandler, getImageData } from '@/server/index'
import { resSuccess } from "@/utils/index"
import { img2imgUpscale } from "@/server/api/index"


export const maxDuration = 300;
export const POST = apiHandler(async (req) => {
  const body = await req.json();
  let { engine, prompt, weight, image, ...other } = body;
  engine = engine || 'esrgan-v1-x2plus'
  let textPrompt = {
    text: prompt,
    ...weight ? { weight } : {}
  }
  let data = {
    engine,
    image,
    ...prompt ? { text_prompts: [textPrompt] } : {},
    ...other
  }
  let result = getImageData((await img2imgUpscale(data)).artifacts, engine, prompt);
  return resSuccess(result)

}, {
  schema: joi.object({
    image: joi.string().required()
  })
})