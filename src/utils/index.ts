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
interface ITextPromptInfo { text: string, weight?: number }
export function getPromptAndWeight(prompt: string): ITextPromptInfo[] {
  let _prompt = prompt.split("\n");
  let _text_prompts: ITextPromptInfo[] = [];
  _prompt.forEach((item) => {
    let _arr = item.trim().split(":");
    if (_arr.length) {
      let _weight = _arr.pop();
      if (isNaN(Number(_weight))) {
        let text = [..._arr, _weight].join(':');
        text && _text_prompts.push({ text })
      } else {
        let text = [..._arr].join(':');
        text && _text_prompts.push({ text, weight: Number(_weight) })
      }
    }
  })

  return _text_prompts
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