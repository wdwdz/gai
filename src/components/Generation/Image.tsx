import dayjs from 'dayjs'
import cloneDeep from "lodash/cloneDeep"
import { useState, useMemo, useEffect, FC } from "react"
import { Space, Image, Button, Spin, Empty, Input, message, ImageProps, Upload, UploadFile, UploadProps, GetProp, Tooltip } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import { useAtom, userInfoAtom, projectAtom, selectImageAtom, imageCanvasAtom, selectRecordAtom, paramsDataAtom, settingAtom, IProject, IRecord, IImages } from "@/store/index"
import { getPromptAndWeight, getSettingValue, getBase64, limitImage, uuid } from "@/utils/index"
import * as api from "@/apis/index"
import { IMAGES_NUMBER } from "@/config/index"
import { ACTION_TYPE, RECORD_FROM_TYPE, IMAGE_FALLBACK } from "@/config/enums"
import { fabric } from 'fabric'

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
  let [inPaint, setInPaint] = useState(false);
  let [userInfo,] = useAtom(userInfoAtom);
  let [projects, setProject] = useAtom(projectAtom);
  let [settingInfo,] = useAtom(settingAtom);
  let [selectRecord, setSelectRecord] = useAtom(selectRecordAtom);
  let [paramsData, setParamsData] = useAtom(paramsDataAtom);
  let [selectImage,] = useAtom(selectImageAtom);
  let [imgCanvases, setImgCanvases] = useAtom(imageCanvasAtom);

  // update project record
  async function updateProjectRecord(record: IRecord, params: Record<string, any>) {
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
    setSelectRecord(record);
    setParamsData({ ...paramsData, [record.id]: params })
    await autoSaveProject(record);
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

  // project auto-save
  const autoSaveProject = async (newRecord: any) => {
    if (!userInfo?.uid) {
      return;
    }
    let projectData = project.data;
    if (!projectData) {
      return;
    }
    if (!projectData.records) {
      projectData.records = [];
      projectData.records.push(newRecord);
    } else {
      projectData.records.push(newRecord);
    }
    await api.save({
      uid: userInfo.uid, projects: [cloneDeep(project.data)]
    });
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
    let newRecord;
    setLoading(true)
    try {
      let params = {
        ...getSettingValue(settingInfo),
        samples: IMAGES_NUMBER,
        text_prompts
      }
      let datas = await api.text2img(params);
      let id = uuid();
      newRecord = {
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
      }
      await updateProjectRecord(newRecord, params)
    } catch (error) {
      console.log(error)
      message.error((error as any).message)
    } finally {
      setLoading(false)
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
    try {
      setLoading(true)
      let params:any = {
        ...getSettingValue(settingInfo),
        text_prompts
      }
      let from = RECORD_FROM_TYPE.none;
      let id = uuid();
      let fromId = selectRecord ? selectRecord.fromId ?? id : id;
      let newRecord;

      if (inPaint) {
        let image = "";
        if (selectImgInfo.length) {
          image = selectImgInfo.map(item => item.src)[0];
          from = ['index', selectImgInfo[0].index].join('_')
        }
        if (!image) {
          message.warning("Please select a picture to enlarge")
          return;
        }
        // generate inpaint image for masking
        let imgindex = selectImgInfo[0].index;
        let canvas = imgCanvases[imgindex] as any;
        let canvasWrapperId = `canvas-wrapper-${imgindex}`;
        let canvasWrapper = document.getElementById(canvasWrapperId) as HTMLDivElement;
        let mask = canvas.toDataURL('image/png');
        canvas.isDrawingMode = false;
        params.image = image;
        params.mask = mask;
        let response = await api.imgInPaint(params);
        delete params.image;
        delete params.mask;
        canvas.clear();
        canvasWrapper.style.display = 'none';
        newRecord = {
          id,
          fromId,
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          type: CLICK_TYPES.i,
          from,
          label: [CLICK_TYPES.i].join(':'),
          prompt: project.data.prompt,
          imgs: [...selectImgInfo].map(item => {
            let data = response[0];
            let src = data.image;
            delete data.image
            return { ...data, index: item.index, src }
          })
        };
        await updateProjectRecord(newRecord, params)
        setInPaint(false);
      } else {
        let images = Object.values(imgs).map(item => item.src);
        if (selectImgInfo.length) {
          images = Array(IMAGES_NUMBER).fill(selectImgInfo.map(item => item.src)[0]);
          from = ['index', selectImgInfo[0].index].join('_')
        }
        if (fileList.length) {
          fromId = id;
          images = Array(IMAGES_NUMBER).fill(fileList.map(item => item.url)[0]);
          from = RECORD_FROM_TYPE.upload
        }
        params.images = images;
        let datas = await api.img2img(params);
        newRecord = {
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
        };
        await updateProjectRecord(newRecord, params)
      }
    } catch (error) {
      message.error((error as any).message)
    } finally {
      setLoading(false)
    }
  }
  // inpaint button event
  const handleInPaint = async () => {
    const canvasWrapper = document.getElementById(`canvas-wrapper-${selectImgInfo[0].index}`) as HTMLDivElement;
    if (inPaint) {
      canvasWrapper.style.display = 'none';
      setInPaint(false);
      return;
    }
    setInPaint(true);
    if (!project.data) { return; }
    let image = "";
    let from = RECORD_FROM_TYPE.none;
    let imgIndex = selectImgInfo[0].index;
    if (selectImgInfo.length) {
      image = selectImgInfo.map(item => item.src)[0];
      from = ['index', imgIndex].join('_')
    };
    if (!image) {
      message.warning("Please select a picture to inpaint")
      return;
    }
    try {
      canvasWrapper.style.display = 'block';
      const fabricCanvas = imgCanvases[imgIndex];
      fabricCanvas.clear();
      fabricCanvas.isDrawingMode = true;
      // // Set drawing properties
      fabricCanvas.freeDrawingBrush.color = 'white';
      fabricCanvas.freeDrawingBrush.width = 20;
    } catch (error) {
      canvasWrapper.style.display = 'none';
      message.error("Error initializing inpaint, please refresh browser and try again.")
    }
  }
  // selection button event
  const handleEnlarge = async () => {
    if (!project.data) { return; }
    let image = "";
    let from = RECORD_FROM_TYPE.none;
    if (selectImgInfo.length) {
      image = selectImgInfo.map(item => item.src)[0];
      from = ['index', selectImgInfo[0].index].join('_')
    }
    if (!image) {
      message.warning("Please select a picture to enlarge")
      return;
    }
    setLoading(true)
    try {
      let params = {
        image
      }
      let datas = await api.img2imgUpscale(params);

      let id = uuid();
      let fromId = selectRecord ? selectRecord.fromId ?? id : id;
      let newRecord = {
        id,
        fromId,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        type: CLICK_TYPES.s,
        from,
        label: [CLICK_TYPES.s].join(':'),
        prompt: "",
        imgs: [...selectImgInfo].map(item => {
          let data = datas[0];
          let src = data.image;
          delete data.image
          return { ...data, index: item.index, src }
        })
      }
      await updateProjectRecord(newRecord, params)
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
      
      let recordImgs = records.map(item => {
        return item.imgs
      }).reverse();

      if (recordImgs.length) {
        let data = {
          ...imgs,
          ...selectImage
        };
        Object.values(data).forEach((item, index) => {
          item.selected = item.selected || false;
        })
        // fill in the image data if one is empty
        if (Object.keys(data).length < IMAGES_NUMBER) {
          for (let i = 0; i < IMAGES_NUMBER; i++) {
            if (data[i]) { continue };
            data[i] = {
              index: i,
              src: recordImgs[0][0].src,
              selected: false
            }
          }
        }
        setImgs(data);
      }

    } else {
      setSelectRecord(null);
      setImgs({})
    }
    // Check if necessary divs are available
    const canvasWrapperAvailable = !!document.getElementById(`canvas-wrapper-0`);
    if (!canvasWrapperAvailable) {
      return;
    }
    // Initialize canvases if doesn't exist
    if (imgCanvases.length) {
      return;
    }
    let canvases: fabric.Canvas[] = [];
    for (let index = 0; index < 2; index++) {
      const canvasId = `canvas-${index}`
      const canvasWrapperId = `canvas-wrapper-${index}`
      const canvasWrapper = document.getElementById(canvasWrapperId) as HTMLDivElement;
      const newCanvas = document.createElement("canvas");
      newCanvas.id = canvasId;
      canvasWrapper.appendChild(newCanvas);
      const fabricCanvas = new fabric.Canvas(newCanvas, {width: 300, height: 300});
      canvases.push(fabricCanvas);
    }
    setImgCanvases(canvases); 
  }, [project]);

  // update record selected image list
  let imgList = useMemo(() => {
    let data = {
      ...imgs,
      ...selectImage
    }
    setImgs(data)
    Object.keys(imgs).forEach(key => {
      data[key].selected = imgs[key].selected
    })
    return data
  }, [selectImage])

  // image component props
  const getImgProps = (img: IImages, index: number): ImageProps => {
    // setImgs from useEffect is asynchorous, so we need to check if it's empty
    let src = Object.keys(imgs).length === 0 ? '' : img?.src;
    return {
      width: 300,
      height: 300,
      preview: false,
      src: src,
      alt: "",
      style: {
        borderWidth: img?.selected ? 3 : 0,
        borderStyle: 'solid',
        borderColor: "blue",
        cursor: 'pointer',
        pointerEvent: img?.src ? 'auto' : 'none',
        objectFit: "cover"
      } as React.CSSProperties,
      fallback: IMAGE_FALLBACK
    }
  }
  // selected image event
  const handleSelectImage = (index: number) => {
    let img = imgList[index];
    if (!img || inPaint) { return }
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
        <span>Prompts:</span>
        <Space align="start">
          <TextArea rows={5} value={project.data?.prompt ?? ''} onChange={handlePromptChange} style={{ width: 400 }} />
          {/* {UploadElement} */}
        </Space>
        <Space align="start">
          <Button disabled={loading || !project.data?.prompt || inPaint} onClick={handleGeneration}>Generation</Button>
          <Tooltip title="You can select or upload the image you want to variation.">
            <Button disabled={loading || !project.data?.prompt || disableVariationBtn} onClick={handleVariation}>Variation</Button>
          </Tooltip>

          {/* <Button disabled={loading || !(selectImgInfo.length) || inPaint} onClick={handleEnlarge}>Enlarge</Button> */}
          <Button 
            disabled={loading || !(selectImgInfo.length)}
            onClick={handleInPaint}
            style={inPaint ? { backgroundColor: 'blue', color: 'white' } : {}}
          >Paint</Button>
        </Space>
      </Space>
      <Space direction="vertical">
        {project.data ?
          <>
            <Space wrap={true} align="start">
              {Array(IMAGES_NUMBER).fill(null).map((_, index) => {
                let _loading = loading;
                let _img = imgList[index];
                return <Spin spinning={_loading} key={index}>
                  <Image
                    id={`image-${index}`}
                    alt='' {...getImgProps(_img, index)}
                    onClick={() => handleSelectImage(index)}
                  />
                  <div
                    id={`canvas-wrapper-${index}`}
                    style={{ display: 'none', position: 'absolute', top: 0, left: 0 }}
                  >
                  </div>
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