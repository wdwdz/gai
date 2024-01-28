
/**
 * 组合url
 * @param url
 * @param query
 * @returns {*}
 */
function convertUrl(url: string, query: Record<string, any>) {
  if (query) {
    let search;
    switch (typeof query) {
      case 'object':
        search = (new URLSearchParams(query)).toString();
        break;
      case 'string':
        search = query;
    }
    if (search) {
      url = [url, search].join(url.indexOf('?') === -1 ? '?' : '&');
    }
  }
  return url;
}
function checkData(data: any) {
  if (data.code === 200) {
    return Promise.resolve(data)
  } else {
    return Promise.reject(data)
  }
}

class Http {
  token = "";
  setToken(token: string) {
    this.token = token
  }
  getToken() {
    return this.token;
  }
  getHeader() {
    return {
      'Content-type': 'application/json',
      "Authorization": `Bearer ${this.token}`
    }
  }
  async response(res: Response) {
    if (res.ok) {
      return checkData(await res.json())
    } else {
      return Promise.reject(await res.json())
    }
  }
  //get 
  async get(url: string, query: Record<string, any>) {
    const response = await fetch(convertUrl(url, query), {
      headers: {
        ...this.getHeader()
      }
    });
    return this.response(response);
  }
  //POST
  async post<T>(url: string, datas: T) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...this.getHeader()
      },
      body: JSON.stringify(datas)
    })

    return this.response(response);
  }

  //PUT
  async put<T>(url: string, datas: T) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        ...this.getHeader()
      },
      body: JSON.stringify(datas)
    })
    return this.response(response);
  }

  //delete
  async delete(url: string, query: Record<string, any>) {
    const response = await fetch(convertUrl(url, query), {
      method: "DELETE",
      headers: {
        ...this.getHeader()
      }
    })
    return this.response(response);
  }
}

export const http = new Http()