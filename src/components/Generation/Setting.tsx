import { FC } from "react";
import { Drawer, Form, Select, InputNumber } from "antd";
import { settingAtom, useAtom } from "@/store/index"
import { ai } from "@/config/index"
import { STYLE_PRESET } from "@/config/enums";
const Component: FC<{ open: boolean, close: () => void }> = ({ open, close }) => {
  let [settingInfo, setSettingInfo] = useAtom(settingAtom);
  let [formRef] = Form.useForm()

  const handleChange = ()=>{
    let value = formRef.getFieldsValue();
    let newSettings = {...settingInfo,...value};
    if (!value.style_preset) {
      delete newSettings.style_preset
    }
    setSettingInfo(newSettings)
  }
  return <Drawer open={open} onClose={() => close()} title="Setting" width={500} >
    <Form
      form={formRef}
      labelCol={{ flex: "100px" }}
      wrapperCol={{ flex: 1 }}
      layout="horizontal"
      variant="filled"
      initialValues={settingInfo}
    >
      <Form.Item label="Engine" name='engine'>
      <Select options={ai.engines.map((item)=>({value:item.id,label:item.name}))} onChange={handleChange} />
      </Form.Item>

      <Form.Item label="Seed" name='seed'>
        <InputNumber min={0} max={4294967295} style={{width:"100%"}} onChange={handleChange}/>
      </Form.Item>
      <Form.Item label="Steps" name='steps'>
        <InputNumber min={10} max={50} style={{width:"100%"}} onChange={handleChange}/>
      </Form.Item>
      <Form.Item label="CFG Scale" name='cfg_scale'>
        <InputNumber min={0} max={35} style={{width:"100%"}} onChange={handleChange}/>
      </Form.Item>
      <Form.Item label="Style preset" name='style_preset'>
        <Select options={STYLE_PRESET.map(value=>({value,label:value}))} onChange={handleChange} allowClear/>
      </Form.Item>
    </Form>
  </Drawer>
}

export default Component;