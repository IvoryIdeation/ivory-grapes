import React, { useEffect, useState } from "react";
import { useEditor } from "@grapesjs/react";
import ReactDOM from "react-dom";

const ANIMATABLE_PROPERTIES = [
  "position",
  "width",
  "height",
  "opacity",
  "background-color",
  "color",
  "margin",
  "padding",
  "border-width",
  "border-color",
  "transform",
  "left",
  "top",
  "right",
  "bottom",
];

function AnimationPanel() {
  const editor = useEditor();
  const [animations, setAnimations] = useState<string[]>([]);
  const [selectedAnimation, setSelectedAnimation] = useState("");
  const [keyframes, setKeyframes] = useState<any>({});
  const [newAnimationName, setNewAnimationName] = useState("");
  const [selectedKeyframe, setSelectedKeyframe] = useState<number>(0);
  const [currKeyframe, setCurrKeyframe] = useState<any>();
  const [parser, setParser] = useState<any>();

  useEffect(() => {
    editor.on("styleable:change", (model, property, value) => {
      console.log(`Property ${property} changed to ${value} on`, model);
    });

    editor.on("change:style", (model) => {
      console.log("Style changed:", model);
    });

    editor.on("change:rules", () => {
      console.log("CSS rules changed");
      const styles = editor.CssComposer.getAll();
      styles.each((style) => {
        console.log(style.toCSS());
      });
    });
    if (!parser && editor) {
      const origParser = editor.Parser.getConfig();
      setParser(origParser);
      editor.setCustomParserCss(keyframeParser);
    }
    if (keyframes) {
      setCurrKeyframe(keyframes[selectedKeyframe]);
    }
  }, [parser, keyframes, animations, currKeyframe, selectedKeyframe]);

  const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    parseFill(e.target.value);
    setSelectedAnimation(e.target.value);
  };

  //get all the % keyframes from the selected animation
  const parseFill = (animation: string) => {
    if (animation) {
      const styles = editor.CssComposer.getAll();
      const frames: string[] = [];
      styles.each((style) => {
        const cssText = style.toCSS();
        const selectorMatch = cssText.match(/@keyframes\s+([^{\s]+)/g);
        if (selectorMatch) {
          if (cssText.includes(animation)) {
            frames.push(cssText);
          }
        }
      });
      //split frames into object with a frame number and a properties array
      //each item in frames looks roughly like @keyframes new{0%{opacity:0;}}
      const objectFrames = {};
      frames.forEach((frame, index) => {
        //get the frame number before the %
        const frameNo = frame.match(/(\d+)%/)[1];

        if (frameNo) {
          // Initialize the frame number key in objectFrames if it doesn't exist
          if (!objectFrames[frameNo]) {
            objectFrames[frameNo] = {};
          }

          const properties = frame
            .match(/(\d+%\{[^}]+\})/g)[0]
            .match(/{([^}]+)}/)[1]
            .split(";");
          properties.forEach((property) => {
            if (property !== "") {
              //each property looks roughly like opacity:0;
              const [key, value] = property.split(":");
              const cleanValue = value.replace(";", "");
              // Assign the property and value to the appropriate frame in objectFrames
              objectFrames[frameNo][key.trim()] = cleanValue.trim();
            }
          });
        }
      });
      setKeyframes(objectFrames);
      setCurrKeyframe(objectFrames[selectedKeyframe]);
    }
  };

  const keyframeParser = (css) => {
    //check if the css is a keyframe
    if (css.includes("@keyframes")) {
      // Normalize the input by removing newlines and extra spaces
      const normalizedCSS = css.replace(/\s+/g, " ").trim();
      //check all opening brackets, if there is no space after it, add one

      // Extract the keyframe name
      const nameMatch = normalizedCSS.match(/@keyframes\s+(\w+)\s*{/);
      if (!nameMatch) {
        throw new Error("Invalid keyframes CSS input");
      }
      const keyframeName = nameMatch[1];

      // Extract each keyframe block
      const keyframesBlocks = normalizedCSS.match(/(\d+% \{[^}]+\})/g);
      if (!keyframesBlocks) {
        throw new Error("No keyframes found");
      }

      // Process each keyframe block
      const result = keyframesBlocks.map((block) => {
        const selectorMatch = block.match(/(\d+%|\w+)\s*{/);
        if (!selectorMatch) {
          throw new Error("Invalid keyframe block");
        }
        const selector = selectorMatch[1];

        // Extract properties
        const propertiesMatch = block.match(/{([^}]+)}/);
        if (!propertiesMatch) {
          throw new Error("Invalid keyframe properties");
        }
        const propertiesString = propertiesMatch[1].trim();

        // Convert properties to an object
        const propertiesArray = propertiesString
          .split(";")
          .map((prop) => prop.trim())
          .filter((prop) => prop);
        const propertiesObject = {};
        propertiesArray.forEach((prop) => {
          const [key, value] = prop.split(":").map((item) => item.trim());
          propertiesObject[key] = value;
        });

        return {
          atRule: "keyframes",
          params: keyframeName,
          selectors: selector,
          style: propertiesObject,
        };
      });
      return result;
    } else {
      //process the css as normal by setting the custom parser to default
      editor.setCustomParserCss(parser);
      return editor.Parser.parseCss(css);
    }
  };

  const handleAddAnimation = () => {
    if (newAnimationName) {
      const css = `@keyframes ${newAnimationName} {
          0% { top: 0; }
          100% { top: 100px;}
        }`;
      editor.CssComposer.addRules(css);
      setAnimations([...animations, newAnimationName]);
      setNewAnimationName("");
    }
  };

  const removeAnimation = (animationName) => {
    const cssComposer = editor.CssComposer;
    const allRules = cssComposer.getAll();

    // Filter out the rules that match the keyframe name
    const filteredRules = allRules.filter((rule) => {
      const cssText = rule.toCSS();
      const regex = new RegExp(`@keyframes\\s+${animationName}\\s*{`);
      return !regex.test(cssText);
    });

    // Reset the CssComposer with the filtered rules
    cssComposer.getAll().reset(filteredRules);
  };

  const handlePropertyChange = (property: string, value: string) => {
    const updatedKeyframes = { ...keyframes };

    // Add or update the keyframe if it doesn't exist
    if (!updatedKeyframes[selectedKeyframe]) {
      updatedKeyframes[selectedKeyframe] = {};
    }

    if (value === "") {
      // Remove the property if the new value is an empty string
      delete updatedKeyframes[selectedKeyframe][property];
    } else {
      // Add or update the property
      updatedKeyframes[selectedKeyframe][property] = value;
    }

    // Remove the keyframe if it has no properties left
    if (Object.keys(updatedKeyframes[selectedKeyframe]).length === 0) {
      delete updatedKeyframes[selectedKeyframe];
    }

    setKeyframes(updatedKeyframes);

    // Create the new CSS string from the updated keyframes
    const css = `@keyframes ${selectedAnimation} {
      ${Object.entries(updatedKeyframes)
        .map(([key, properties]) => {
          const propsString = Object.entries(properties)
            .map(([prop, val]) => `${prop}: ${val};`)
            .join(" ");
          return `${key}% { ${propsString} }`;
        })
        .join(" ")}
    }`;

    //Remove the old animation
    removeAnimation(selectedAnimation);
    // Update the CSS in the editor
    editor.CssComposer.addRules(css);
  };

  return (
    <div>
      <h4>Animation Panel</h4>
      <div>
        <label>New Animation:</label>
        <input
          type="text"
          value={newAnimationName}
          onChange={(e) => setNewAnimationName(e.target.value)}
        />
        <button onClick={handleAddAnimation}>Add Animation</button>
      </div>
      <div>
        <label>Select Animation:</label>
        <select onChange={handleAnimationChange} value={selectedAnimation}>
          <option value="">Select Animation</option>
          {animations.map((anim, index) => (
            <option key={index} value={anim}>
              {anim}
            </option>
          ))}
        </select>
      </div>
      {ReactDOM.createPortal(
        <div className="timeline-bar">
          <div className="timeline-header">Timeline</div>
          <div className="timeline-content">
            {Array.from({ length: 101 }).map((_, index) => (
              <div
                key={index}
                className={`timeline-section ${
                  selectedKeyframe === index ? "frame-selected" : ""
                } ${keyframes && keyframes[index] ? "hasstyle" : ""}`}
                onClick={() => setSelectedKeyframe(index)}
              >
                {selectedKeyframe === index ? <span>{index}%</span> : null}
              </div>
            ))}
          </div>
        </div>,
        document.querySelector(".gjs-editor")
      )}
      <div className="panel__animations">
        {ANIMATABLE_PROPERTIES.map((prop, index) => (
          <div key={index} className="gjs-field gjs-field-text">
            <span className="gjs-input-holder">
              <label>{prop}</label>
              <input
                type="text"
                value={
                  // Find the value for the selected keyframe and property
                  currKeyframe && currKeyframe[prop] ? currKeyframe[prop] : ""
                }
                onChange={(e) => handlePropertyChange(prop, e.target.value)}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimationPanel;
