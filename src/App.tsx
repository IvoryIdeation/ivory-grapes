import * as React from "react";
import GjsEditor, {
  AssetsProvider,
  Canvas,
  ModalProvider,
  StylesProvider,
  WithEditor,
} from "@grapesjs/react";
import type { Editor, EditorConfig } from "grapesjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ForkPanel from "./components/ForkPanel";
import "./style.css";
import ReactDOM from "react-dom";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

const gjsOptions: EditorConfig = {
  height: "100vh",
  storageManager: false,
  undoManager: { trackSelection: false },
  selectorManager: { componentFirst: true },
  projectData: {
    assets: [
      "https://via.placeholder.com/350x250/78c5d6/fff",
      "https://via.placeholder.com/350x250/459ba8/fff",
      "https://via.placeholder.com/350x250/79c267/fff",
      "https://via.placeholder.com/350x250/c5d647/fff",
      "https://via.placeholder.com/350x250/f28c33/fff",
    ],
    pages: [
      {
        name: "Homepage",
        component: `<h1>GrapesJS React Custom UI</h1>`,
      },
    ],
  },
};

function App() {
  const onEditor = (editor: Editor) => {
    console.log("Editor loaded");
    (window as any).editor = editor;
  };
  return (
    // @ts-ignore
    <ThemeProvider theme={theme}>
      <GjsEditor
        className="gjs-custom-editor text-white bg-slate-900"
        grapesjs="https://unpkg.com/grapesjs@0.21.8/dist/grapes.min.js"
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        options={gjsOptions}
        plugins={[
          {
            id: "grapesjs-preset-webpage",
            src: "https://unpkg.com/grapesjs-preset-webpage@1.0.2",
          },
          {
            id: "gjs-blocks-basic",
            src: "https://unpkg.com/grapesjs-blocks-basic",
          },
          {
            id: "grapesjs-plugin-forms",
            src: "https://unpkg.com/grapesjs-plugin-forms@2.0.5",
          },
          {
            id: "grapesjs-component-countdown",
            src: "https://unpkg.com/grapesjs-component-countdown@1.0.1",
          },
          {
            id: "grapesjs-plugin-export",
            src: "https://unpkg.com/grapesjs-plugin-export@1.0.11",
          },
          {
            id: "grapesjs-tabs",
            src: "https://unpkg.com/grapesjs-tabs",
          },
          {
            id: "grapesjs-custom-code",
            src: "https://unpkg.com/grapesjs-custom-code@1.0.1",
          },
          {
            id: "grapesjs-touch",
            src: "https://unpkg.com/grapesjs-touch@0.1.1",
          },
          {
            id: "grapesjs-parser-postcss",
            src: "https://unpkg.com/grapesjs-parser-postcss@1.0.1",
          },
          {
            id: "grapesjs-tooltip",
            src: "https://unpkg.com/grapesjs-tooltip@0.1.7",
          },
          {
            id: "grapesjs-tui-image-editor",
            src: "https://unpkg.com/grapesjs-tui-image-editor@0.1.3",
          },
          {
            id: "grapesjs-typed",
            src: "https://unpkg.com/grapesjs-typed@1.0.5",
          },
          {
            id: "grapesjs-style-bg",
            src: "https://unpkg.com/grapesjs-style-bg@2.0.1",
          },
        ]}
        onEditor={onEditor}
      >
        <WithEditor>
          <ForkPanel />
        </WithEditor>
      </GjsEditor>
    </ThemeProvider>
  );
}

export default App;
