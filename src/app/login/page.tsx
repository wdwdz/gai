'use client'

import { useState ,useEffect} from "react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Space, Form, Input ,message} from 'antd';
import {CloseOutlined} from "@ant-design/icons"
import { userInfoAtom, accessCodeAtom, useAtom } from "@/store/index"
import * as firebase from "@/lib/firebase";
import css from "@/page.module.scss"

import {IFormInfo} from "@/lib/firebase"

function Component() {
  let [userInfo] = useAtom(userInfoAtom);
  let [, setAccessCode] = useAtom(accessCodeAtom);

  let navigate = useRouter()

  let [formRef] = Form.useForm<IFormInfo>()
  let [loading, setLoading] = useState(false);
  useEffect(()=>{
    if(userInfo?.uid){
      navigate.replace("/")
    }
  },[userInfo?.uid])
  const onFinish = async (values:IFormInfo) => {
    try {
      setLoading(true)
      if (values.accessCode && (values.username || values.password)) {
        // Only one of access code or username and password should be provided
        message.error('Please provide either an access code or username and password, not both.');
        return;
      } 
      if (!values.accessCode && !(values.username && values.password)) {
        // Either access code or username and password should be provided
        message.error('Please provide either an access code or username and password.');
        return;
      }
      if (values.accessCode) {
        const accessCodes = await firebase.getAccessCodes();
        if (!accessCodes) {
          message.error('Invalid access code');
          return;
        }
        const accessCodesArr = Object.keys(accessCodes);
        if (!accessCodesArr.includes(values.accessCode)) {
          message.error('Invalid access code');
          return;
        }
        await firebase.anonymousSignIn();
        setAccessCode(accessCodes[values.accessCode]);
        formRef.resetFields();
        message.success("Log in successfully")
        return;
      }

      await firebase.login({ email: values.username as string, password: values.password })
      formRef.resetFields();
      message.success("Log in successfully")
    } catch (error) {
      console.log("onFinish ~ error:",error)
      message.error('Login failed, wrong username or password')
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={css.wrapper}>
      <div className={css.container}>
      <Link href="/" className={css.close}><CloseOutlined  /></Link>
        <h1 className={css.title}>Log in</h1>

        <Form
          form={formRef}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >

          <Form.Item
            label="Access Code"
            name="accessCode"
          >
            <Input />
          </Form.Item>

          {/* <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ padding: '0.5rem', background: '#f0f0f0' }}>OR</span>
          </div>

          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                min: 8,
                message: "Password must be at least 8 characters long"
              }
            ]}
          >
            <Input.Password />
          </Form.Item> */}


          <Form.Item>
            <Space direction="vertical" align="center" className={css['w-full']}>
              <Space size={[20, 0]}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Log in
                </Button>
                {/* <Link href="/register"> Sign up</Link> */}
              </Space>
            </Space>
          </Form.Item>
        </Form>
      </div>

    </div>
  )
}

export default Component
