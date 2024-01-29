import dayjs from 'dayjs'
import { useState, useMemo, useEffect, FC } from "react"
import { Space, Image, Button, Spin, Empty, Input, message, ImageProps, Upload, UploadFile, UploadProps, GetProp, Tooltip } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import { useAtom, projectAtom, selectImageAtom, selectRecordAtom, settingAtom, IProject, IRecord, IImages } from "@/store/index"
import { getPromptAndWeight, getSettingValue, getBase64, limitImage, uuid } from "@/utils/index"
import * as api from "@/apis/index"
import { IMAGES_NUMBER } from "@/config/index"
import { ACTION_TYPE, RECORD_FROM_TYPE } from "@/config/enums"

const { TextArea } = Input;
const CLICK_TYPES = { ...ACTION_TYPE };

interface IProps {
  project: {
    index: number,
    data: IProject | null
  }
}
const Component: FC<IProps> = ({ project }) => {
  let [loading, setLoading] = useState(false);
  let [projects, setProject] = useAtom(projectAtom);
  let [settingInfo,] = useAtom(settingAtom);
  let [selectRecord, setSelectRecord] = useAtom(selectRecordAtom);
  let [selectImage,] = useAtom(selectImageAtom);

  let [clickType, setClickType] = useState(CLICK_TYPES.g)
  // update project record
  function updateProjectRecord(record: IRecord) {
    console.log("updateProjectRecord ~ record:", record, record.id, record.fromId)
    if (project.index === -1) {
      message.warning("Please create new project.")
      return;
    }
    let { data, index } = project;

    let records = [record, ...(data?.records ?? [])];

    let newData = {
      ...data,
      records
    } as IProject
    projects.splice(index, 1, newData);
    setProject([...projects])
    setSelectRecord(record)
  }
  // update project prompt
  function updateProjectPrompt(prompt: string) {
    if (project.index === -1) {
      message.warning("Please create new project.")
      return;
    }
    let { data, index } = project;

    let newData = {
      ...data,
      prompt
    } as IProject
    projects.splice(index, 1, newData);
    setProject([...projects])
  }

  // =================================================================  
  // generation button event
  const handleGeneration = async () => {
    if (!project.data) { return; }
    let text_prompts = getPromptAndWeight(project.data.prompt ?? '');
    if (!text_prompts.length) {
      message.warning("Prompt is required.")
      return;
    }
    setClickType(CLICK_TYPES.g)
    setLoading(true)
    try {
      let params = {
        ...getSettingValue(settingInfo),
        samples: IMAGES_NUMBER,
        text_prompts
      }
      let datas = await api.text2img(params);
      let id = uuid();
      updateProjectRecord({
        id,
        fromId: id,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        type: CLICK_TYPES.g,
        from: RECORD_FROM_TYPE.none,
        label: [CLICK_TYPES.g,].join(':'),
        prompt: project.data.prompt,
        imgs: Array(IMAGES_NUMBER).fill(null).map((_, index) => {
          let data = datas[index];
          let src = data.image;
          delete data.image
          return { ...data, index, src }
        })
      })

      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      message.error((error as any).message)
    }

  }
  // variation button event
  const handleVariation = async () => {
    if (!project.data) { return; }

    let text_prompts = getPromptAndWeight(project.data.prompt ?? '');
    if (!text_prompts.length) {
      message.warning("Prompt is required.")
      return;
    }
    let images = Object.values(imgs).map(item => item.src);
    let from = RECORD_FROM_TYPE.none;
    let id = uuid();
    let fromId = selectRecord ? selectRecord.fromId : id;
    if (selectImgInfo.length) {
      images = Array(IMAGES_NUMBER).fill(selectImgInfo.map(item => item.src)[0]);
      from = ['index', selectImgInfo[0].index].join('_')
    }
    if (fileList.length) {
      fromId = id;
      images = Array(IMAGES_NUMBER).fill(fileList.map(item => item.url)[0]);
      from = RECORD_FROM_TYPE.upload
    }
    setClickType(CLICK_TYPES.v)
    setLoading(true)
    try {
      let params = {
        ...getSettingValue(settingInfo),
        images,
        text_prompts
      }
      let datas = await api.img2img(params);

      updateProjectRecord({
        id,
        fromId,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        type: CLICK_TYPES.v,
        from,
        label: [CLICK_TYPES.v].join(':'),
        prompt: project.data.prompt,
        imgs: Array(IMAGES_NUMBER).fill(null).map((_, index) => {
          let data = datas[index];
          let src = data.image;
          delete data.image
          return { ...data, index, src }
        })
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
      message.error((error as any).message)
    }
    setLoading(false)
  }
  // selection button event
  const handleSelection = async () => {
    if (!project.data) { return; }
    let image = "";
    if (selectImgInfo.length) {
      image = selectImgInfo.map(item => item.src)[0]
    }
    if (!image) {
      message.warning("Please select a picture to enlarge")
      return;
    }
    setClickType(CLICK_TYPES.s)
    setLoading(true)
    try {
      let params = {
        image
      }
      let datas = await api.img2imgUpscale(params);

      let id = uuid();
      let fromId = selectRecord ? selectRecord.fromId : id;
      updateProjectRecord({
        id,
        fromId,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        type: CLICK_TYPES.s,
        label: [CLICK_TYPES.s].join(':'),
        prompt: "",
        imgs: [...selectImgInfo].map(item => {
          let data = datas[0];
          let src = data.image;
          delete data.image
          return { ...data, index: item.index, src }
        })
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
      message.error((error as any).message)
    }
    setLoading(false)
  }

  // =================================================================
  // prompt change event
  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let prompt = event.target.value;
    updateProjectPrompt(prompt)
  }
  // image list (type object {})
  let [imgs, setImgs] = useState<{ [index: string]: IImages }>({});
  // selected image info 
  let selectImgInfo = useMemo(() => {
    return Object.values(imgs).filter(item => !!item.selected)
  }, [imgs])

  //  update image list
  useEffect(() => {
    if (project.index === -1) { return setImgs({}) };
    let records = project.data?.records;
    if (records?.length) {
      if (!selectRecord) {
        setSelectRecord(records[0]);
      }
      setImgs(() => ({}));
      records.map(item => {
        return item.imgs
      }).reverse().forEach(_imgs => {
        _imgs.forEach(img => {
          setImgs(imgs => {
            return {
              ...imgs,
              [img.index]: { ...img, selected: false }
            }
          })
        })
      })

    } else {
      setSelectRecord(null);
      setImgs({})
    }
  }, [project]);
  // update record selected image list
  let imgList = useMemo(() => {
     let data ={
      ...imgs,
      ...selectImage
    }
    Object.keys(imgs).forEach(key=>{
      data[key].selected = imgs[key].selected
    })
    return data
  }, [imgs, selectImage])
  // image component props
  const getImgProps = (img: IImages, index: number): ImageProps => {
    return {
      width: 300,
      height: 300,
      preview: false,
      src: img?.src,
      alt: "",
      style: {
        borderWidth: img?.selected ? 3 : 0,
        borderStyle: 'solid',
        borderColor: "blue",
        cursor: 'pointer',
        pointerEvent: img?.src ? 'auto' : 'none',
        objectFit: "cover"
      } as React.CSSProperties,
      fallback: "data:image/png;base64,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"
    }
  }
  // selected image event
  const handleSelectImage = (index: number) => {
    let img = imgList[index];
    if (!img) { return }
    // if(!img.src){return}
    let selected = img.selected
    if (!selected) {
      Object.values(imgs).forEach(item => item.selected = false)
    }
    img.selected = !selected;
    setImgs({
      ...imgs,
      [index]: img
    })
  }

  // =================================================================
  type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const handleBeforeUpload = (file: FileType) => {
    let { state, message: msg } = limitImage(file)
    if (!state) {
      message.error(msg);
      return Upload.LIST_IGNORE;
    }
    return false;
  };
  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = document.createElement("img");
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };
  const handleUploadChange: UploadProps['onChange'] = async (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(1 * -1);

    // 2. Read from response and show file link
    newFileList = await Promise.all(newFileList.map(async (file) => {
      if (!file.url && !file.preview) {
        let img = await getBase64(file.originFileObj as FileType);
        file.url = img
      }
      file.status = 'done'
      return file;
    }));

    setFileList(newFileList);
  };

  const UploadBtnElement = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  const UploadElement = <Upload
    listType="picture-card"
    fileList={fileList}
    beforeUpload={handleBeforeUpload}
    onPreview={onPreview}
    onChange={handleUploadChange}
  >
    {fileList.length >= IMAGES_NUMBER ? null : UploadBtnElement}
  </Upload>


  let disableVariationBtn = useMemo(() => {
    if (fileList.length) {
      return false;
    }
    if (selectImgInfo.length) {
      return !selectImgInfo[0]?.src
    }
    return Object.values(imgs).every(item => {
      return !item.src
    })

  }, [imgs, selectImgInfo, fileList])

  return (<div style={{ flex: 1 }}>
    <Space direction="vertical" style={{ width: "100%" }} align='start'>
      <Space align="start" direction="vertical">
        <span>Prompt options:</span>
        <Space align="start">
          <TextArea rows={5} value={project.data?.prompt ?? ''} onChange={handlePromptChange} style={{ width: 400 }} />
          {UploadElement}
        </Space>
        <Space align="start">
          <Button disabled={loading || !project.data?.prompt} onClick={handleGeneration}>Generation</Button>
          <Tooltip title="You can select or upload the image you want to variation.">
            <Button disabled={loading || !project.data?.prompt || disableVariationBtn} onClick={handleVariation}>Variation</Button>
          </Tooltip>

          <Button disabled={loading || !(selectImgInfo.length)} onClick={handleSelection}>Enlarge</Button>
        </Space>
      </Space>
      <Space direction="vertical">
        {project.data ?
          <>
            <Space wrap={true} align="start">
              {Array(IMAGES_NUMBER).fill(null).map((_, index) => {
                let _loading = loading;
                let _img = imgList[index];
                let _hasSelect = !!selectImgInfo.length
                if (_hasSelect && loading && clickType === CLICK_TYPES.v && !_img.selected) {
                  // _loading = false
                }
                return <Spin spinning={_loading} key={index}>
                  <Image alt='' {...getImgProps(_img, index)} onClick={() => handleSelectImage(index)} />
                </Spin>
              })}
            </Space>
          </>
          : <Empty style={{ paddingTop: 20 }} description="Please create new project" />}
      </Space>
    </Space>
  </div>);
}

export default Component
