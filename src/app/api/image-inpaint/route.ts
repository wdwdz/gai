import joi from 'joi'
import { apiHandler, getImageData } from '@/server/index'
import { resSuccess } from "@/utils/index"
import { imgInpaint } from "@/server/api/index"


export const maxDuration = 300;
export const POST = apiHandler(async (req) => {
  const body = await req.json();
  let { engine, text_prompts, ...other } = body;
  engine = engine || 'stable-diffusion-512-v2-1'
  // engine = engine || 'stable-diffusion-v1-6'
  let data = {
    engine,
    text_prompts,
    ...other
  }
  const imgData = await imgInpaint(data);
  let result = getImageData([{base64: imgData.image}], engine);
  return resSuccess(result)
}, {
  schema: joi.object({
    engine: joi.string().required(),
    text_prompts: joi.array().required().min(1)
  })
})