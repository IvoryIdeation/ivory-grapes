import * as React from "react";
import { StylesResultProps } from "@grapesjs/react";
import { Collapse } from "antd";
import { mdiMenuDown } from "@mdi/js";
import Icon from "@mdi/react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { MAIN_BG_COLOR } from "../common";
import StylePropertyField from "./utils/StylePropertyField";

const accordionIcon = <Icon path={mdiMenuDown} size={0.7} />;

export default function CustomStyleManager({
  sectors,
}: Omit<StylesResultProps, "Container">) {
  return (
    <div className="gjs-custom-style-manager text-left">
      {sectors.map((sector) => (
        <Collapse
          key={sector.getId()}
          className="!bg-slate-800"
          accordion={true}
          collapsible="header"
          defaultActiveKey={["0"]}
          bordered={false}
          items={[
            {
              key: "1",
              label: sector.getName(),
              children: (
                <div style={{ paddingTop: 5 }} className={`${MAIN_BG_COLOR} flex flex-wrap`}>
                  {sector.getProperties().map((prop) => (
                    <StylePropertyField key={prop.getId()} prop={prop} />
                  ))}
                </div>
              ),
            },
          ]}
        ></Collapse>
      ))}
    </div>
  );
}
