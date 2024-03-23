import { initializeApp } from "firebase/app";
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  createUserWithEmailAndPassword,
  browserSessionPersistence,
  setPersistence,
  getAuth,
  onAuthStateChanged,
  signOut,
  updateProfile,
  UserCredential,
  User,
} from "firebase/auth";
import { firebase, version } from "@/config/index"

import { getDatabase, ref, set, get, child } from "firebase/database";


const app = initializeApp(firebase);
const auth = getAuth(app);

let userCredential: UserCredential | null = null;
setPersistence(auth, browserSessionPersistence);
export { app, auth }

export type TUser = User & { token?: string }
export const getUserInfo = async (user?: User): Promise<TUser | null> => {
  user = user ?? userCredential?.user;
  if (!user) {
    return null
  }
  let token = await getIdToken(user);
  let data: TUser = { ...user.toJSON(), token } as TUser
  return data
}
export const getIdToken = async (user: User) => {
  const idToken = await user.getIdToken();
  return idToken
}

// 登录
export const login = async ({ email, password }: IFormInfo) => {
  userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return { ...(await getUserInfo()) }
}
export const logout = async () => {
  return await signOut(auth)
}

// 注册
export const register = async ({ displayName, email, password }: IFormInfo): Promise<TUser> => {
  userCredential = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
    await userCredential.user.reload()
  }
  return { ...(await getUserInfo()) } as TUser;
}
export const addUserStateChange = (callback: (user: TUser | null) => void) => {
  return onAuthStateChanged(auth, async user => {
    callback(user !== null ? await getUserInfo(user) : user)
  })
}

// anonymously sign in
export const anonymousSignIn = async () => {
  userCredential = await signInAnonymously(auth);
  return { ...(await getUserInfo()) } as TUser;
}

const db = getDatabase(app);
export const getDbRef = ({ path, uid }: { path: string, uid: string }) => {
  return ref(db, [version, 'server', uid, path].join("/"))
}
export const updateRefData = ({ path, data, uid }: { path: string, data: any, uid: string }) => {
  let ref = getDbRef({ path, uid });
  return set(ref, data)
}
export const getRefData = ({ path, uid }: { path: string, uid: string }) => {
  let ref = getDbRef({ path, uid });
  return get(ref).then(data => data.exists() ? data.val() : null)
}
 
export const getProjects = async (uid: string) => {
  let projectsRef = ref(db, [version, 'server', uid, 'projects'].join("/"));
  return get(projectsRef).then(data => data.exists() ? data.val() : null);
}

// get access codes
export const getAccessCodeRef = async () => {
  return ref(db, [version, 'access_code'].join("/"));
}
export const getAccessCodes = async () => {
  let ref = await getAccessCodeRef();
  return get(ref).then(data => data.exists() ? data.val() : null)
}

export interface IFormInfo {
  displayName?: string, email: string, password: string,
  username?: string,
  nickname?: string,
  accessCode?: string,
}