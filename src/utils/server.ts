export const resSuccess = <T>(data: T, code: number = 200, message: string = "success") => {
  return { code, data, message }
}

export const resError = (code: number, message: string, data: any = null) => {
  return resSuccess(data, code, message)
}