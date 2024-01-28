'use client'

import { useState, useEffect } from "react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Space, Form, Input, message } from 'antd';
import { CloseOutlined } from "@ant-design/icons"
import { userInfoAtom, useAtom } from "@/store/index"
import * as firebase from "@/lib/firebase";
import css from "@/page.module.scss"


import {IFormInfo} from "@/lib/firebase"


function Component() {
  let [userInfo, setUserInfo] = useAtom(userInfoAtom);
  let navigate = useRouter()
  let [formRef] = Form.useForm<IFormInfo>()
  let [loading, setLoading] = useState(false);
  useEffect(() => {
    if (userInfo?.uid) {
      navigate.replace("/")
    }
  }, [userInfo?.uid])
  const onFinish = async (values:IFormInfo) => {
    try {
      setLoading(true)
      setUserInfo(await firebase.register({ email: values.email, password: values.password, displayName: values.nickname }))
      formRef.resetFields();
      message.success("Sign up successfully")
    } catch (error:any) {
      console.log("onFinish ~ error:", error)
      message.error(`Sign up failed: ${error.message}`)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <Link href="/" className={css.close}><CloseOutlined /></Link>
        <h1 className={css.title}>Sign up</h1>

        <Form
          form={formRef}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >

          <Form.Item
            name="nickname"
            label="Nickname"
            tooltip="What do you want others to call you?"
            rules={[{ required: true, message: 'Please input your nickname!', whitespace: true }]}
          >
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              }
            ]}
          >
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              }, {
                min: 8,
                message: "Password must be at least 8 characters long"
              }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The new password that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" align="center" className={css['w-full']}>
              <Space size={[20, 0]}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Sign up
                </Button>
                <Link href="/login">Log in</Link>
              </Space>
            </Space>
          </Form.Item>
        </Form>
      </div>

    </div>
  )
}

export default Component
