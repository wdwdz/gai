import { ai } from "@/config/index"
import { base64ToFile } from "@/utils/index"
import FormData from 'form-data'
import fs from 'fs'
let Authorization = `Bearer ${ai.apiKey}`

function getApiUrl(url: string) {
  return [ai.host, url].join("")
}

// 获取可用模型列表
export async function getEngines() {
  const { default: fetch } = await import("node-fetch");
  let url = getApiUrl('/v1/engines/list');
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization,
    },
  });
  if (!response.ok) {
    return []
  }
  let list = await response.json()
  return list;
}

// 文本转图片
export async function text2img({ engine, ...data }: { engine: string, [key: string]: any }): Promise<any> {
  const { default: fetch } = await import("node-fetch");
  let url = getApiUrl(`/v1/generation/${engine}/text-to-image`);
  let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization,
  }
  let body = JSON.stringify({ samples: ai.samples, ...data });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })
  if (!response.ok) {
    throw await response.json()
  }
  return await response.json()
}

// 图片转图片
export async function img2img({ engine, ...data }: { engine: string, [key: string]: any }) {
  const { default: fetch } = await import("node-fetch");
  const formData = new FormData();
  formData.append('init_image', base64ToFile(data.init_image));
  data.text_prompts.forEach((item: any, index: number) => {
    Object.keys(item).forEach(key => {
      formData.append(`text_prompts[${index}][${key}]`, item[key])
    })
  })
  let url = getApiUrl(`/v1/generation/${engine}/image-to-image`);
  let headers = {
    ...formData.getHeaders(),
    Accept: 'application/json',
    Authorization,
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!response.ok) {
    throw await response.json()
  }
  return await response.json()
}

// 图片转图片
export async function img2imgUpscale({ engine, ...data }: { engine: string, [key: string]: any }): Promise<any> {
  const { default: fetch } = await import("node-fetch");
  const formData = new FormData();
  formData.append('image', base64ToFile(data.image));
  (data.text_prompts ?? []).forEach((item: any, index: number) => {
    Object.keys(item).forEach(key => {
      formData.append(`text_prompts[${index}][${key}]`, item[key])
    })
  })
  let url = getApiUrl(`/v1/generation/${engine}/image-to-image/upscale`);
  let headers = {
    ...formData.getHeaders(),
    Accept: 'application/json',
    Authorization,
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!response.ok) {
    throw await response.json()
  }
  return await response.json()
}

export async function imgInpaint({ engine, ...data }: { engine: string, [key: string]: any }): Promise<any> {
  const { default: fetch } = await import("node-fetch");
  const formData = new FormData();
  const imgPath = await base64ToTempImg(data.image);
  const maskPath = await base64ToTempImg(data.mask);
  formData.append('image', fs.createReadStream(imgPath));
  formData.append('mask', fs.createReadStream(maskPath));
  if (data.text_prompts) {
    formData.append("prompt", data.text_prompts.join(","));
  }
  formData.append("output_format", "png");
  let url = getApiUrl(`/v2beta/stable-image/edit/inpaint`);
  let headers = {
    ...formData.getHeaders(),
    Accept: 'application/json',
    Authorization,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!response.ok) {
    throw await response.json()
  }
  return await response.json()
}

async function base64ToTempImg(str: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let base64 = str.replace(/^data:image\/\w+;base64,/, "");
    let buffer = Buffer.from(base64, 'base64');
    // Create a temporary file with random name
    const tempFilePath = `/tmp/${Math.random().toString(36).substring(7)}.png`;
    fs.writeFile(tempFilePath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(tempFilePath);
      }
    });
  });
}
