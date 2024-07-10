import * as React from "react";
import {
  BlocksProvider,
  LayersProvider,
  PagesProvider,
  SelectorsProvider,
  StylesProvider,
  TraitsProvider,
  WithEditor,
} from "@grapesjs/react";
import {
  mdiBrush,
  mdiLayers,
  mdiViewGridPlus,
  mdiTextBoxMultiple,
  mdiCog,
} from "@mdi/js";
import Icon from "@mdi/react";
// import Tabs from "@mui/material/Tabs";
import { Tabs, TabsProps } from "antd";
import { useState } from "react";
import CustomBlockManager from "./CustomBlockManager";
import { MAIN_BORDER_COLOR, cx } from "../common";
import CustomPageManager from "./CustomPageManager";
import CustomLayerManager from "./CustomLayerManager";
import CustomSelectorManager from "./CustomSelectorManager";
import CustomStyleManager from "./CustomStyleManager";
import CustomTraitManager from "./CustomTraitManager";
import AnimationPanel from "../../AnimationPanel";
import ForkPanel from "../../ForkPanel";

const defaultTabProps = {
  className: "!min-w-0",
};

export default function RightSidebar({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "",
      icon: <Icon size={1} path={mdiBrush} />,
      children: (
        <>
          <SelectorsProvider>
            {(props) => <CustomSelectorManager {...props} />}
          </SelectorsProvider>
          <StylesProvider>
            {(props) => {
              return (
                <WithEditor>
                  <CustomStyleManager {...props} />
                  <ForkPanel />
                </WithEditor>
              );
            }}
          </StylesProvider>
        </>
      ),
    },
    {
      key: "2",
      label: "",
      icon: <Icon size={1} path={mdiCog} />,
      children: (
        <TraitsProvider>
          {(props) => <CustomTraitManager {...props} />}
        </TraitsProvider>
      ),
    },
    {
      key: "3",
      label: "",
      icon: <Icon size={1} path={mdiLayers} />,
      children: (
        <LayersProvider>
          {(props) => <CustomLayerManager {...props} />}
        </LayersProvider>
      ),
    },
    {
      key: "4",
      label: "",
      icon: <Icon size={1} path={mdiViewGridPlus} />,
      children: (
        <BlocksProvider>
          {(props) => <CustomBlockManager {...props} />}
        </BlocksProvider>
      ),
    },
    {
      key: "5",
      label: "",
      icon: <Icon size={1} path={mdiTextBoxMultiple} />,
      children: (
        <PagesProvider>
          {(props) => <CustomPageManager {...props} />}
        </PagesProvider>
      ),
    },
    {
      key: "6",
      label: "",
      icon: <div className="fa fa-play" />,
      children: (
        <AnimationPanel/>
      ),
    },
  ];

  return (
    <div className={cx("gjs-right-sidebar flex flex-col", className)}>
      <Tabs
        defaultActiveKey="1"
        items={items}
        style={{ height: "100%", overflowY: "auto" }}
        tabBarGutter={24}
        centered={true}
        destroyInactiveTabPane={true}
      />
    </div>
  );
}
