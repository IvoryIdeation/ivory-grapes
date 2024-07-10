import { useEditor } from "@grapesjs/react";

export default function CustomBlocks() {
  const editor = useEditor();
  // Add a custom resizable div component
  editor.DomComponents.addType("resizable-div", {
    model: {
      defaults: {
        tagName: "div",
        draggable: true,
        resizable: {
          tl: 1, // Top-left
          tc: 1, // Top-center
          tr: 1, // Top-right
          cl: 1, // Center-left
          cr: 1, // Center-right
          bl: 1, // Bottom-left
          bc: 1, // Bottom-center
          br: 1, // Bottom-right
        },
      },
    },
    view: {},
  });

  editor.BlockManager.add("resizable-div-block", {
    label: "Resizable Div",
    content: {
      type: "resizable-div", // Match the type defined in the component
      style: {
        width: "200px",
        height: "200px",
        "background-color": "black",
      },
    },
    category: "Basic", // Optional: Add a category for better organization
    attributes: { class: "gjs-block-resizable-div" },
  });

  // Add more custom components here
}
