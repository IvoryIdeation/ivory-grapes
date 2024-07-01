import React, { useEffect } from "react";
import { useEditor } from "@grapesjs/react";

function StyleManagerMod({ editor }) {
  useEffect(() => {
    if (editor) {
      const sm = editor.StyleManager;
      sm.addSector('animations', {
        name: 'Animations',
        open: false,
        buildProps: ['animation', 'animation-duration', 'animation-timing-function', 'animation-iteration-count'],
        properties: [
          { name: 'Animation', property: 'animation' },
          { 
            name: 'Duration', 
            property: 'animation-duration',
            type: 'number', // Ensure this is a number type for unit suffix
            units: ['s'], // Add the 's' unit for seconds
            defaults: '1s', // Default value with 's'
          },
          { name: 'Timing Function', property: 'animation-timing-function' },
          { name: 'Iteration Count', property: 'animation-iteration-count' },
        ]
      });
    }
  }, [editor]);

  return (
    
    <div className="gjs-sm-sector">
      <div className="gjs-sm-properties">
        {/* Additional UI elements can be added here if needed */}
      </div>
    </div>
  );
}

export default StyleManagerMod;
