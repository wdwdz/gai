"use client"
import { ConfigProvider } from "antd"
import { useEffect, FC } from "react";
import { userInfoAtom, updateTokenAtom, useAtom, } from "@/store/index"
import * as firebase from "@/lib/firebase"

const App: FC<{ children: React.ReactNode }> = ({ children }) => {
  useAtom(updateTokenAtom);
  let [, setUserInfo] = useAtom(userInfoAtom)
  useEffect(() => {
    let off = firebase.addUserStateChange(user => {
      setUserInfo(user)
    })
    return () => {
      off()
    }
  }, [])

  return (
    <ConfigProvider >{children}</ConfigProvider>
  );

}

export default App