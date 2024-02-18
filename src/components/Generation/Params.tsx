import { useMemo, FC } from "react"
import { Descriptions,Divider, Image,Space, ImageProps, DescriptionsProps } from "antd"
import { useAtom, selectRecordAtom, IImages, paramsDataAtom } from "@/store/index"
import { ACTION_TYPE,IMAGE_FALLBACK } from "@/config/enums"

const TYPE_CONTENT = {
  [ACTION_TYPE.g]:"Generation",
  [ACTION_TYPE.v]:"Variation",
  [ACTION_TYPE.s]:"Enlarge"
}
const Component: FC = () => {
  let [selectRecord, setSelectRecord] = useAtom(selectRecordAtom);
  let [paramsData, _] = useAtom(paramsDataAtom);
  let currentParams = useMemo(() => {
    if (!selectRecord?.id) {
      return null
    }
    return paramsData[selectRecord.id] ?? null;
  }, [paramsData, selectRecord])



  function getParamsData(): DescriptionsProps['items'] {
    if (!currentParams || !selectRecord) {
      return null as unknown as DescriptionsProps['items']
    }
    
    let items: any[] = [{
      key:"type",label:"type",children:TYPE_CONTENT[selectRecord.type]
    }];

    Object.entries(currentParams).filter(([key, value]) => !!value).forEach(([key, value]) => {
      let excludeKeys = ['image', 'images']
      let data: any = { key, label: key ,labelStyle:{width:150}};
      if (typeof value !== 'object' && !excludeKeys.includes(key)) {
        data.children = value;
      } else if (Array.isArray(value) && !excludeKeys.includes(key)) {
        data.children = <Space direction="vertical">{value.map((val, i) => <Space wrap={true} styles={{item:{display:"inline"}}}  split={<Divider type="vertical" />} key={i}>{Object.entries(val).map(([k,v])=>{
          return <span key={k}>{k}：{v as any}</span>
        })}</Space>)}</Space>
      } else {
        if (key === 'image') {
          value = [value];

        }
        data.children = <Space>{(value as string[]).map((val, i) => <span key={i}>
          <Image src={val} style={{ width: "100px" }} alt='' />
        </span>)}</Space>
      }
      items.push(data);
    })
    return items;

  }

  return (currentParams ? <Space direction='vertical' style={{ width: "100%" }} styles={{ item: { width: "100%" } }}>
    <span>Settings:</span>
    <Descriptions style={{ width: "100%" }} column={1} bordered items={getParamsData()} size="small" />
  </Space> : null);
}

export default Component
