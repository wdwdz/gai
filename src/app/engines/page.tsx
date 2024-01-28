'use client'
import { useState, useEffect, FC } from "react";

const Page: FC = () => {
  let [engines, setEngines] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/engines").then(res => {
      return res.ok ? res.json() : [];
    }).then(res => {
      setEngines(res.data);
    })
  }, [])
  return <pre style={{height:'100vh'}}>{JSON.stringify(engines,null,2)}</pre>

}

export default Page;