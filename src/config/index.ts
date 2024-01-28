import credential from './sdapp-5196f-firebase-adminsdk-26iei-e5eff72d29.json'

export { credential };
export const firebase = {
  apiKey: "AIzaSyANgKR6CQGA2XNLW_ja0AbuTvTisRXefFU",
  authDomain: "sdapp-5196f.firebaseapp.com",
  databaseURL: "https://sdapp-5196f-default-rtdb.firebaseio.com",
  projectId: "sdapp-5196f",
  storageBucket: "sdapp-5196f.appspot.com",
  messagingSenderId: "346250607061",
  appId: "1:346250607061:web:1c09b59afc4b45e70fa55c",
  measurementId: "G-CCBW8THJP9"
};

export const baseUrl = process.env.NODE_ENV === "development" ? '/api' : "/api"

export const version = "v_1_1"
export const ai = {
  apiKey: 'sk-mzuE8FzVVX6ioKT6ynOe3WQ0wOaPUmQOferSOc3T86jh0S5E',
  host: "https://api.stability.ai",
  samples: 1,
  engines: [
    {
      "description": "Stability-AI Stable Diffusion v1.6",
      "id": "stable-diffusion-v1-6",
      "name": "Stable Diffusion v1.6",
      "type": "PICTURE"
    },
    {
      "description": "Stability-AI Stable Diffusion v2.1",
      "id": "stable-diffusion-512-v2-1",
      "name": "Stable Diffusion v2.1",
      "type": "PICTURE"
    },
    {
      "description": "Stability-AI Stable Diffusion XL v0.9",
      "id": "stable-diffusion-xl-1024-v0-9",
      "name": "Stable Diffusion XL v0.9",
      "type": "PICTURE"
    },
    {
      "description": "Stability-AI Stable Diffusion XL v1.0",
      "id": "stable-diffusion-xl-1024-v1-0",
      "name": "Stable Diffusion XL v1.0",
      "type": "PICTURE"
    },
    {
      "description": "Stability-AI Stable Diffusion XL Beta v2.2.2",
      "id": "stable-diffusion-xl-beta-v2-2-2",
      "name": "Stable Diffusion v2.2.2-XL Beta",
      "type": "PICTURE"
    },
    {
      "description": "Real-ESRGAN_x2plus upscaler model",
      "id": "esrgan-v1-x2plus",
      "name": "Real-ESRGAN x2",
      "type": "PICTURE"
    }
  ]
}
export const IMAGES_NUMBER = 2;