import { useMemo, FC } from "react";
import { Space, Timeline, Empty, Image, Button } from "antd"
import { selectImageAtom, useAtom, IProject, IImages, IRecord } from "@/store/index";
import css from "@/page.module.scss"


const RECORD_TYPES = { v: 'v', g: 'g', s: 'e' }

interface IProps {
  project: {
    index: number,
    data: IProject | null
  }
}
const Component: FC<IProps> = ({ project }) => {
  let [, setSelectImage] = useAtom(selectImageAtom);
  let records = useMemo(() => {
    return project?.data?.records ?? []
  }, [project])

  const handleSelectImage = (imgs: IImages[]) => {
    setSelectImage(imgs.reduce<Record<string, IImages>>((obj, img) => {
      obj[img.index] = img;
      return obj
    }, {}))
  }

  const getTimeline = (datas: IRecord[]) => {
    function getChildrenComponent(imgs: IImages[], record: IRecord) {
      let Label = <Space className="date" style={{ width: "100%" }} key={1} >{record.date}{Object.values(RECORD_TYPES).includes(record.type) ? <Button className='btn-select' size="small" onClick={() => handleSelectImage(imgs)}>Select</Button> : null}</Space>

      let Images = (<Space key={2} style={{ marginTop: "10px" }}>
        {imgs.map((img, index) => {
          return (<div key={index} style={{ border: "1px solid #ddd" }} >
            <p style={{ textAlign: "center", padding: "2px 0", margin: 0 }}>{index === 0 ? <>{record.label.replace(/:<.*>$/g, '')}:&lt;<span title={record.prompt} style={{
              maxWidth: 110,
              display: 'inline-block',
              textOverflow: 'ellipsis',
              whiteSpace: "nowrap", overflow: "hidden",
              verticalAlign: '-5px'
            }}>{record.prompt}</span>&gt;</> : <>{record.label.replace(/:<.*>$/g, '')}:&lt;&gt;</>}</p>
            <Image alt="" width={150} height={100} style={{ objectFit: "cover" }} src={img.src}></Image>
          </div>)
        })}
      </Space>)

      return <div className={css.record}>{Label}{Images}</div>

    }
    return datas.map(item => ({
      children: getChildrenComponent(item.imgs, item)
    }))
  }

  return (<Space direction="vertical" style={{ width: "100%" }} align="start">
    <Space style={{ marginBottom: 20 }}>
      <span>Record:</span>
    </Space>

    {records.length ? <Timeline items={getTimeline(records)} /> : <Empty />}

  </Space>);
}

export default Component
