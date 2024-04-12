"use client"

import cloneDeep from "lodash/cloneDeep"
import { Layout, Dropdown, Menu, theme, Button, message, Space, Row, Col } from 'antd';
import { useAtom, projectAtom, projectSaveAtom, userInfoAtom, selectRecordAtom, accessCodeAtom, IProject } from "../store"
import { useState, useMemo, useEffect } from "react";

import { PlusOutlined, SettingFilled } from "@ant-design/icons"
import GenerationImages from "@/components/Generation/Image"
import GenerationRecords from "@/components/Generation/Record"
import Params from "@/components/Generation/Params"
import Setting from "@/components/Generation/Setting"
import { uuid } from '@/utils/index'
import * as api from "@/apis/index"

import * as firebase from "@/lib/firebase";
import Link from 'next/link'

const { Header, Content, Footer } = Layout;

export default function Page() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  // userinfo 
  let [userInfo, setUserInfo] = useAtom(userInfoAtom);
  let [accessCode] = useAtom(accessCodeAtom);
  let [selectRecord, setSelectRecord] = useAtom(selectRecordAtom);

  // create message
  const [projects, setProjects] = useAtom(projectAtom);
  const [projectSave, setProjectSave] = useAtom(projectSaveAtom);
  const items = useMemo(() => {
    if (!userInfo?.uid) {
      return []
    }
    let map: any = projectSave[userInfo.uid] ?? {};
    return projects.filter(item => !map[item.key]).map((item, index) => {
      delete item.saved;
      return {
        ...item,
        key: `${item.key}`,
        onClick({ key }: { key: string }) {
          setSelectRecord(null);
          setActiveTab(key)
        }
      }
    })
  }, [projects, projectSave, userInfo?.uid]);
  const savedList = useMemo(() => {
    if (!userInfo?.uid) {
      return []
    }
    let map = projectSave[userInfo.uid] ?? {};
    return projects.filter(item => !!map[item.key]).map((item, index) => {
      return {
        label: item.label,
        key: `${item.key}`,
        onClick({ key }: { key: string }) {
          setSelectRecord(null);
          setActiveTab(key)
        }
      }
    })
  }, [projects, projectSave, userInfo?.uid]);

  const [activeTab, setActiveTab] = useState<string>();

  // fetch projects from Firebase
  useEffect(() => {
    const fetchProjects = async (uid: string) => {
      try {
        const fetchedProjects = await firebase.getProjects(uid);
        let fetchedProjectsArr: IProject[] = [];
        Object.values(fetchedProjects)?.forEach((item: any) => {
          fetchedProjectsArr.push(item)
        });
        setProjects(fetchedProjectsArr);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    // fetch projects from Firebase if there are no projects and user is logged in
    if (userInfo?.uid) {
      fetchProjects(userInfo?.uid);
    }
  }, []);
  
  useEffect(() => {
    if (!userInfo?.uid) {
      setActiveTab(void 0)
    } else if (projects.length && activeTab === void 0) {
      setActiveTab(`${projects[0].key}`)
    }
  }, [projects, userInfo?.uid])

  let project = useMemo(() => {
    let index = projects.findIndex(({ key }) => {
      return `${key}` === `${activeTab}`
    });
    if (index !== -1) {
      return { data: projects[index], index }
    }
    return { data: null, index }
  }, [activeTab, projects]);
  const handleProject = () => {
    if (!userInfo?.uid) {
      message.warning("Please log in to your account.")
      return;
    }
    setProjects([{ key: uuid(), label: `project ${projects.length}` }, ...projects])
  }

  const [saveLoading, setSaveLoading] = useState(false);
  function updateProjectSave(saved: boolean) {
    let { data } = project;
    if (!data || !userInfo) { return }
    let key = data.key;
    let uid = userInfo.uid;
    let map = projectSave[uid] ?? {};
    map[key] = saved;

    setProjectSave({ ...projectSave, [uid]: map })
  }
  const handleSave = async () => {
    if (!userInfo?.uid) {
      message.warning("Please log in to your account.")
      return;
    }
    if (!project.data) {
      return;
    }
    try {
      setSaveLoading(true)
      await api.save({
        uid: userInfo.uid, projects: [cloneDeep(project.data)]
      });
      updateProjectSave(true)
      message.success("Save success")
    } catch (error) {
      message.error((error as any).message)
    } finally {
      setSaveLoading(false)
    }
  }
  const handleLogout = async () => {
    try {
      await firebase.logout();
    } catch (error) {
      console.log(error)
    }
  }

  let [visible, setVisible] = useState(false)

  return (
    <Layout style={{
      minHeight: "100vh", width: "100%",
      minWidth: 1100,
    }}>
      <Header
        style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center', position: "relative", paddingRight: 60
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeTab!]}
          items={items} style={{ flex: 1, minWidth: 0 }}
        />
        <Button icon={<PlusOutlined />} title='new project' onClick={handleProject} />
        {userInfo?.uid ? <>
          <Dropdown menu={{ items: savedList }} placement="bottomRight" arrow={true}>
            <Button style={{ marginLeft: 15 }} type="primary" title='Saved list'>Submit list</Button>
          </Dropdown>
          <Button loading={saveLoading} title='Save project' onClick={handleSave} type="primary" style={{ marginLeft: 15 }}>Submit</Button></> : null}

        <Space style={{ marginLeft: 15 }} >
          {userInfo?.uid ? 
            <><Dropdown menu={{ items: [{ label: "Log out", onClick: handleLogout, key: 0 }] }} placement="bottomRight" >
              <span style={{ color: "#fff" }} title={userInfo?.displayName ?? userInfo?.email ?? ''}>
                {userInfo.displayName || userInfo.email || 'Anonymous'}
              </span>
            </Dropdown></> : 
            <Link style={{ color: "#fff" }} href="/login"><span style={{ color: "#fff" }} >Log in</span></Link>}
            <a style={{ position: 'absolute', top: '50%', right: 0, padding: "0 15px", color: "#fff", fontSize: 20, transform: 'translateY(-50%)' }} title="Setting" onClick={() => setVisible(true)}><SettingFilled /></a>
        </Space>
      </Header>
      <Content
        style={{
          padding: '20px 48px',
        }}
      >
        <div
          style={{
            maxWidth: 1400, margin: "auto",
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
            marginBottom: 24
          }}
        >
          <Row gutter={[20,10]}>
            <Col >
              <GenerationImages project={project} />
            </Col>
            <Col flex='auto' style={{width:0}}>
              <Params />
            </Col>
          </Row>
        </div>
        {!accessCode || accessCode?.showPromptHistory ? (
          <div
            style={{
              maxWidth: 1400, margin: "auto",
              background: colorBgContainer,
              minHeight: 280,
              padding: 24,
              borderRadius: borderRadiusLG,
            }}
          >
            <GenerationRecords project={project} />
          </div>
        ) : null}
      </Content>
      <Setting open={visible} close={() => setVisible(false)} />
    </Layout>
  );
}
