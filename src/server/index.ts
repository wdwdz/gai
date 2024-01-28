import { base64ToImage } from "@/utils/index";
export * from "./apiHandler";
export * from "./errHandler"
export function getImageData(list: any[], engine: string, prompt?: string) {
  return list.map(item => {
    let image = base64ToImage(item.base64);
    return { image, engine };
  })
}
