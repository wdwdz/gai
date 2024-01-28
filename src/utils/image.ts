export function base64ToImage(str: string) {
  const prefix = "data:image/png;base64,";
  return [prefix, str].join('')
}
export function base64ToFile(str: string) {
  let base64 = str.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, 'base64');
}

export function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function limitImage(file: File, { type = ['image/png', 'image/jpeg', 'image/jpg'], size = 1 }: { type?: string[], size?: number } = {
  type: ['image/png', 'image/jpeg', 'image/jpg'],
  size: 1
}) {
  const isJpgOrPng = type.includes(file.type);
  if (!isJpgOrPng) {
    return { state: false, message: `You can only upload JPG/PNG file!` }
  }
  const isLt = file.size / 1024 / 1024 <= size;
  if (!isLt) {
    return { state: false, message: `Image must smaller than ${size} MB!` }
  }
  return {
    state: isJpgOrPng && isLt,
    message: ''
  };
}