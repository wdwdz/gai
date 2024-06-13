import { updateRefData, upsertArrayData } from './firebase'
import { resError, resSuccess } from "@/utils/index"
export async function saveProject(projects: any[], uid: string, userInfo: any) {
  let _path = ''
  let _records: any = [];
  let _projects = []
  let key = '';
  _projects = projects.map(item => {
    key = item.key;
    _records.push({
      key,
      records: item.records ?? []
    })
    delete item.records;
    return item;
  })
  console.log("saveProject ~ _projects:", _projects, _records)


  function _setProjects(data: any[]) {
    return data.map(item => {
      _path = ['projects', item.key].join('/');
      return updateRefData({ path: _path, data: item, uid })
    })
  }
  function _setRecords(data: any[]) {
    let _arr: any[] = [];
    data.forEach(({ key, records }) => {
      _arr.push(...records.map((item: any, index: number) => {
        _path = ['records', key, index].join('/');
        return updateRefData({ path: _path, data: item, uid })
      }))
    })
    return _arr
  }
  function _setUserInfo(data: any) {
    _path = ['userInfo'].join('/');
    return updateRefData({ path: _path, data, uid })
  }
  try {
    await Promise.all([_setUserInfo(userInfo), ..._setProjects(_projects), ..._setRecords(_records)])
    return resSuccess({ state: true })
  } catch (error) {
    console.log("saveProject ~ error:", error)
    return Promise.reject(resError(400, (error as any).message))
  }
}

export async function trackEvent(event: any) {
  // {
  //   "type": "click",
  //   "target": "Generation Button" | "Select/Deselect Image" | ...,
  //   "Timestamp": [TIMESTAMP],
  //   "projectId": [PROJECT_ID],
  //   "recordId": ["" | RECORD_ID],
  //   "selectedImage": [null | 0 | 1],
  // }
  let _path = ['events'].join('/');
  // insert event into the events array
  try {
    await upsertArrayData({ path: _path, data: event, uid: event.uid })
    return resSuccess({ state: true })
  } catch (error) {
    return Promise.reject(resError(400, (error as any).message))
  }
}