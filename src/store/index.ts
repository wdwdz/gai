import { atom } from "jotai"
import { atomEffect } from "jotai-effect";
import { http } from "@/utils/fetch"
import { createJSONStorage, atomWithStorage } from "jotai/utils"
import { ai } from "@/config/index"
import localForage from "localforage";

let isServer = typeof window === 'undefined';

var storage = localForage.createInstance({
  name: "store_v1"
});
const asyncStorage = createJSONStorage<any>(isServer ? () => void 0 : () => storage as any);

export interface IAccessCode {
  showPromptHistory:  boolean,
}
export interface IImages {
  src: string,
  index: number,
  selected?: boolean,


}
export interface IRecord {
  id: string,
  fromId: string,
  date: string,
  type: string,
  label: string,
  prompt?: string,
  from?: string,
  imgs: IImages[]
}
export interface IProject {
  key: string,
  label: string,
  prompt?: string,
  saved?: boolean,
  records?: IRecord[]
}
export interface ISaveProject {
  [uid: string]: { [key: string]: boolean }
}
export const projectAtom = atomWithStorage<IProject[]>('project', [], asyncStorage, { getOnInit: !isServer });
export const projectSaveAtom = atomWithStorage<ISaveProject>('project-save', {}, asyncStorage, { getOnInit: !isServer })

export interface ISettingInfo {
  engine: string,
  seed?: number,
  steps?: number,
  cfg_scale?: number,
  style_preset?: string
}
export const settingAtom = atomWithStorage<ISettingInfo>('setting', { engine: ai.engines[0].id, seed: 0, steps: 30, /* cfg_scale: 7 */ }, asyncStorage, { getOnInit: !isServer })

export const paramsDataAtom = atomWithStorage<Record<string, any>>('params-data', {}, asyncStorage, { getOnInit: !isServer })

import type { TUser } from "@/lib/firebase"
type IUserInfo = TUser | null
export const userInfoAtom = atom<IUserInfo>(null);
export const updateTokenAtom = atomEffect((get) => {
  let user = get(userInfoAtom);
  http.setToken(user?.token ?? '')
})
export const accessCodeAtom = atom<IAccessCode | null>(null)
export const selectRecordAtom = atom<IRecord | null>(null)
export const selectImageAtom = atom<{ [index: string]: IImages }>((get) => {
  let record = get(selectRecordAtom);
  let data = (record?.imgs ?? []).reduce<Record<string, IImages>>((obj, img) => {
    obj[img.index] = img;
    return obj
  }, {})
  return data
})





export * from "jotai"