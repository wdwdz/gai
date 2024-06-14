"use client";
import { ConfigProvider } from "antd";
import { useEffect, useState, FC } from "react";
import { userInfoAtom, updateTokenAtom, useAtom, joyrideAtom } from "@/store/index";
import * as firebase from "@/lib/firebase";
import Joyride, { Step, CallBackProps } from "react-joyride";

const App: FC<{ children: React.ReactNode }> = ({ children }) => {
  useAtom(updateTokenAtom);
  let [userInfo, setUserInfo] = useAtom(userInfoAtom);
  // userinfo 

  // State to track if the component has mounted on the client side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true after the component mounts
    let off = firebase.addUserStateChange(user => {
      setUserInfo(user);
    });
    return () => {
      off();
    };
  }, []);

  // Define the steps for the tour
  const steps: Step[] = [
    {
      target: '.joyride-start',
      content: 'Welcome to the app! Let me show you around.',
    },
    {
      target: '.joyride-new-project',
      content: 'Add a new project to start.',
    },
    {
      target: '.joyride-prompt',
      content: 'Input your first prompt.',
    },
    {
      target: '.joyride-generation',
      content: 'Click the generation button.'
    },
    {
      target: '.joyride-record',
      content: 'Your generated images and prompt will be here.'
    },
    {
      target: '.joyride-variation',
      content: 'Click the variation button will give you 2 slightly different images.'
    },
    {
      target: '#image-1',
      content: 'Click one image will select it.'
    },
    {
      target: '.joyride-variation',
      content: 'Then click variation again, you will have 2 new images similar to the selected one.'
    },
    {
      target: '.joyride-prompt',
      content: 'You can also input a different prompt to guild how variation works.'
    },
    {
      target: '.joyride-paint',
      content: 'Paint allows you to change in the part of the image you paint.'
    },
    {
      target: '.joyride-record',
      content: 'You can go back to the records area, select the history images and start from there.'
    }

  ];

  let [joyride, setJoyride] = useAtom(joyrideAtom);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    if (status === 'finished' || status === 'skipped' || status === 'paused' || action === 'close') {
      setJoyride({run: false});
    }
  };

  if (!isClient) {
    // Render a loading state or null during SSR
    return null;
  }

  return (
    <ConfigProvider>
      <Joyride
        callback={handleJoyrideCallback}
        steps={steps}
        continuous
        showSkipButton
        run={joyride.run}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      {children}
    </ConfigProvider>
  );
};

export default App;
