import * as React from "react";
import { useEditor, WithEditor } from "@grapesjs/react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import StyleManagerMod from "./StyleManagerMod";
import AnimationPanel from "./AnimationPanel";

function ForkPanel({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const editor = useEditor();
  const [styleManagerEl, setStyleManagerEl] = useState<HTMLElement | null>(null);
  const [viewsContainerEl, setViewsContainerEl] = useState<HTMLElement | null>(null);
  const [timelineEl, setTimelineEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (editor) {
      const styleManager = editor.Panels.getPanel('views-container').view.el;
      if (styleManager) {
        setStyleManagerEl(styleManager);
      }
      const viewsContainer = editor.Panels.getPanel('views-container').view.el;
      if (viewsContainer) {
        setViewsContainerEl(viewsContainer);
        editor.Panels.addPanel({
          id: 'animations-panel',
          el: viewsContainer,
          visible: true,
        });
      }
      

      editor.Panels.addButton('views', {
        id: 'open-animation-panel',
        className: 'fa fa-play',
        command: 'toggle-animation-panel',
        attributes: { title: 'Open Animation Panel' }
      });

      editor.Commands.add('toggle-animation-panel', {
        run(editor) {
          const panel = document.querySelector('.animation-panel') as HTMLElement;
          if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
          }
        }
      });
    }
  }, [editor]);

  return (
    <div className={className}>
      {styleManagerEl && ReactDOM.createPortal(
        <StyleManagerMod editor={editor} />,
        styleManagerEl
      )}
      {viewsContainerEl && ReactDOM.createPortal(
        <div className="animation-panel" style={{ display: 'none' }}>
          <AnimationPanel />
          <div className="panel__animations"></div>
        </div>,
        viewsContainerEl
      )}
    </div>
  );
}

export default function ForkPanelWithEditor(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <WithEditor>
      <ForkPanel {...props} />
    </WithEditor>
  );
}
