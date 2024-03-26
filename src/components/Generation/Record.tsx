import { useMemo, FC } from "react";
import { Space, Timeline, Empty, Image, Button } from "antd"
import { selectRecordAtom, imageCanvasAtom, useAtom, IProject, IImages, IRecord } from "@/store/index";
import css from "@/page.module.scss"
import { ACTION_TYPE } from "@/config/enums"

const RECORD_TYPES = { ...ACTION_TYPE }
const COLOR_MAP = {
  [RECORD_TYPES.g]: "#ffda53",
  [RECORD_TYPES.v]: "#3ebcff",
  [RECORD_TYPES.s]: "#41e55a",
}
interface IProps {
  project: {
    index: number,
    data: IProject | null
  }
}
const Component: FC<IProps> = ({ project }) => {
  let [, setSelectRecord] = useAtom(selectRecordAtom);
  let [imgCanvases,] = useAtom(imageCanvasAtom);
  let records = useMemo(() => {
    return project?.data?.records ?? []
  }, [project])

  let newList = useMemo<any[]>(() => {
    let arr: any[] = [];
    let map: Record<string, any> = {}
    for (let i = records.length - 1; i >= 0; i--) {
      let _record = records[i];
      if(_record.fromId){
        if(!map[_record.fromId]){
          map[_record.fromId] = [_record];
          arr.unshift(map[_record.fromId]);
        }else{
          map[_record.fromId].push(_record)
        }
      }else{
        arr.unshift(_record);
      }
    }
    return arr;
  }, [records]);

  const handleSelectImage = (record:IRecord) => {
    clearCanvas();
    setSelectRecord(record);
  }

  const clearCanvas = () => {
    imgCanvases.forEach(canvas => {
      if (canvas) {
        canvas.clear();
      }
    })
  }

  function getRecordLabel(record: IRecord) {
    return <Space className="date" style={{}} ><span style={{whiteSpace:"nowrap"}}>{record.date}</span>{Object.values(RECORD_TYPES).includes(record.type) ? <Button className='btn-select' size="small" onClick={() => handleSelectImage(record)}>Select</Button> : null}</Space>
  }
  function getRecordImages(record: IRecord) {
    return <Space style={{ marginTop: "10px" }} size={[0,0]}>
      <div style={{ borderWidth: 1, borderStyle: "solid", borderColor: COLOR_MAP[record.type] }} >
        <p style={{ padding: "2px 2px 2px 4px", margin: 0, backgroundColor: COLOR_MAP[record.type] }}>{record.label.replace(/:<.*>$/g, '')}:&lt;<span title={record.prompt} style={{
          display: 'inline-block',
          textOverflow: 'ellipsis',
          whiteSpace: "nowrap", overflow: "hidden",
          verticalAlign: '-5px',
          maxWidth: 165
        }}>{record.prompt}</span>&gt;</p>
        <Space size={[5, 0]} style={{ backgroundColor: '#fff' }}>
          {(record?.imgs ?? []).map((img, index) => {
            return (<Image key={index} alt="" width={100} height={100} style={{ objectFit: "cover" }} src={img.src}></Image>)
          })}
        </Space>
      </div>
    </Space>
  }
  function getRecordItem(record: IRecord) {
    let Label = getRecordLabel(record);
    let Images = getRecordImages(record)
    return <Space direction="vertical" size={[0,0]} key={record.date} className={css.record}>{Label}{Images}</Space>

  }
  function getChildrenComponent(record: IRecord | IRecord[]) {
    if (Array.isArray(record)) {
      return <div style={{ width: "100%", overflowX: "auto" }}><Space>
        {record.map((item) => {
          return getRecordItem(item)
        })}
      </Space>
      
      </div>
    } else {
      return <Space>{getRecordItem(record)}</Space>
    }
  }
  const getTimeline = (datas: IRecord[]) => {
    return datas.map((item: IRecord | IRecord[]) => ({
      children: getChildrenComponent(item)
    }))
  }

  return (<Space direction="vertical" style={{ width: "100%" }} styles={{ item: { width: "100%" } }} align="start">
    <Space style={{ marginBottom: 20 }}>
      <span>Record:</span>
    </Space>

    {records.length ? <Timeline items={getTimeline(newList)} /> : <Empty />}

  </Space>);
}

export default Component
