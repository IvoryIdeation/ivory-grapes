import * as React from "react";
import { useEditor, WithEditor } from "@grapesjs/react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import StyleManagerMod from "./StyleManagerMod";
import AnimationPanel from "./AnimationPanel";

function ForkPanel({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const editor = useEditor();
  const [styleManagerEl, setStyleManagerEl] = useState<HTMLElement | null>(
    null
  );
  const [viewsContainerEl, setViewsContainerEl] = useState<HTMLElement | null>(
    null
  );
  const [timelineEl, setTimelineEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (editor) {
      
    }
  }, [editor]);

  return (
    <div className={className}>
      <StyleManagerMod editor={editor} />
      {/* {viewsContainerEl && ReactDOM.createPortal(
        <div className="animation-panel" style={{ display: 'none' }}>
          <AnimationPanel />
          <div className="panel__animations"></div>
        </div>,
        viewsContainerEl
      )} */}
    </div>
  );
}

export default function ForkPanelWithEditor(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <WithEditor>
      <ForkPanel {...props} />
    </WithEditor>
  );
}
