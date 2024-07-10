import * as React from "react";
import { DevicesProvider, WithEditor } from "@grapesjs/react";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
//import Select from '@mui/material/Select';
import { Select } from "antd";
import { cx } from "./common";
import TopbarButtons from "./TopbarButtons";

export default function Topbar({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("gjs-top-sidebar flex items-center p-1", className)}>
      <DevicesProvider>
        {({ selected, select, devices }) => (
          <Select
            style={{ width: "40%" }}
            value={selected}
            onChange={(val) => select(val)}
          >
            {devices.map((device) => (
              <MenuItem value={device.id} key={device.id}>
                {device.getName()}
              </MenuItem>
            ))}
          </Select>
        )}
      </DevicesProvider>
      <WithEditor>
        <TopbarButtons className="ml-auto px-2" />
      </WithEditor>
    </div>
  );
}
