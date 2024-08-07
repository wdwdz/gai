import { http } from "@/utils/index"
import { baseUrl } from "@/config/index"
import { saveProject, trackEvent } from "@/lib/function";
import { compressImage } from "@/utils/index"

const base_url = baseUrl;
async function compressImages(data: any[]) {
  let result = await Promise.all(data.map(async (item: any) => {
    item.image = await compressImage(item.image);
    return item;
  }))
  return result;
}
export async function text2img(data: any) {
  let result = await http.post(`${base_url}/text-to-image`, data);
  return compressImages(result.data)
}

export async function imgInPaint(data: any) {
  let result = await http.post(`${base_url}/image-inpaint`, data);
  return compressImages(result.data)
}

export async function img2img(data: any) {
  let result = await http.post(`${base_url}/image-to-image`, data);
  return compressImages(result.data)
}
export async function img2imgUpscale(data: any) {
  let result = await http.post(`${base_url}/image-to-image/upscale`, data);
  return compressImages(result.data)
}
export async function save(data: any) {
  let uid: string = data.uid;
  let projects: any[] = data.projects;
  let userInfo: any = data.userInfo;
  if (!uid) {
    return Promise.reject("Please login in your account.")
  }
  if (!projects.length) {
    return Promise.reject("Please select the project first and then save it.")
  }
  return await saveProject(projects, uid, userInfo)
}
export async function track(event: any) {
  event.timestamp = new Date().toISOString();
  return await trackEvent(event)
}
export { }