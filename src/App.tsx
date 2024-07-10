import * as React from "react";
import GjsEditor, {
  AssetsProvider,
  Canvas,
  ModalProvider,
  StylesProvider,
} from "@grapesjs/react";
import { ConfigProvider, theme } from "antd";
import type { Editor, EditorConfig } from "grapesjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { MAIN_BORDER_COLOR } from "./components/react-ui/common";
import CustomModal from "./components/react-ui/CustomModal";
import CustomAssetManager from "./components/react-ui/CustomAssetManager";
import Topbar from "./components/react-ui/Topbar";
import RightSidebar from "./components/react-ui/Sidebar/RightSidebar";
import "./style.css";
import ReactDOM from "react-dom";


// const theme = createTheme({
//   palette: {
//     mode: "dark",
//   },
// });

const gjsOptions: EditorConfig = {
  height: "100vh",
  storageManager: false,
  customUI: false,
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
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorText: "white",
          },
          components: {
            Radio: {
              buttonBg: "rgb(30 41 59 / 1 !important) !important",
              buttonSolidCheckedBg: "#90caf9",
              buttonSolidCheckedColor: "rgb(30 41 59 / 1 !important) !important",
              buttonPaddingInline: 10,
            },
            Select: {
              colorBgContainer: "rgb(30 41 59 / 1 !important) !important",
              multipleItemBg: "#90caf9",
              selectorBg: "rgb(30 41 59 / 1 !important) !important",
              zIndexPopup: 10000,
            },
            Collapse: {
              contentPadding: "3px 8px",
              headerPadding: "6px 20px",
            },
            Tabs: {
              cardHeight: 50,
            }
          },
        }}
      >
        <GjsEditor
          className="gjs-custom-editor text-white bg-slate-900"
          grapesjs="https://unpkg.com/grapesjs@0.21.8/dist/grapes.min.js"
          grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
          options={gjsOptions}
          plugins={[
            // {
            //   id: "grapesjs-preset-webpage",
            //   src: "https://unpkg.com/grapesjs-preset-webpage@1.0.2",
            // },
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
          <div className={`flex h-full border-t ${MAIN_BORDER_COLOR}`}>
            <div className="gjs-column-m flex flex-col flex-grow">
              <Topbar className="min-h-[48px]" />
              <Canvas className="flex-grow gjs-custom-editor-canvas" />
            </div>
            <RightSidebar
              className={`gjs-column-r w-[300px] border-l ${MAIN_BORDER_COLOR}`}
            />
          </div>
          <ModalProvider>
            {({ open, title, content, close }) => (
              <CustomModal
                open={open}
                title={title}
                children={content}
                close={close}
              />
            )}
          </ModalProvider>
          <AssetsProvider>
            {({ assets, select, close, Container }) => (
              <Container>
                <CustomAssetManager
                  assets={assets}
                  select={select}
                  close={close}
                />
              </Container>
            )}
          </AssetsProvider>
        </GjsEditor>
      </ConfigProvider>
  );
}

export default App;
