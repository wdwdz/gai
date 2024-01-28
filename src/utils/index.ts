export * from "./fetch"
export * from "./image"
export * from "./server"
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getPromptAndWeight(prompt: string) {
  let _arr = prompt.split(":");
  let _weight = _arr.pop();
  if (isNaN(Number(_weight))) {
    return { prompt, weight: 0.5 }
  } else {
    return { prompt: _arr.join('|'), weight: Number(_weight) }
  }
}

export function getSettingValue(data: Record<string, any>) {
  return Object.keys(data).filter(key => {
    if (data[key] !== void 0) {
      return true;
    }
    return false;
  }).reduce<Record<string, any>>((newData, key) => {
    newData[key] = data[key];
    return newData;
  }, {})
}