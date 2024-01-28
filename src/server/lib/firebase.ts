import { firebase, credential } from "@/config/index"
import admin from "firebase-admin"
import { uuid } from "@/utils/index"
const app = admin.initializeApp({
  credential: admin.credential.cert(credential as unknown as string),
  databaseURL: firebase.databaseURL
}, uuid());
const auth = admin.auth(app);

export { auth }

export function verifyIdToken(token: string) {
  return auth.verifyIdToken(token);
}