import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useEditor } from "@grapesjs/react";
import {
  Input,
  InputNumber,
  Select,
  Button,
  Tabs,
  TabsProps,
  FloatButton,
  Slider,
  List,
  Skeleton,
  message,
} from "antd";
import ReactDOM from "react-dom";
import { CustomEase, gsap, Flip } from "gsap/all";
import { useGSAP } from "@gsap/react";
import KeyframeEditor from "./KeyframeEditor";
import {
  setAnimations,
  setSelectedAnimation,
  setKeyframes,
  setTrackedKeyframe,
  setSelectedKeyframe,
} from "../_actions";

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
  const dispatch = useDispatch();

  const [triggerMessage, setTriggerMessage] = useState({
    type: "success",
    content: "Animation Panel Loaded!",
  });

  const {
    animations,
    selectedAnimation,
    keyframes,
    selectedKeyframe,
    trackedKeyframe,
  } = useSelector((state: any) => state.animation);
  // const [animations, setAnimations] = useState<string[]>([]);
  // const [selectedAnimation, setSelectedAnimation] = useState("");
  // const [keyframes, setKeyframes] = useState<any>({});
  // const [selectedKeyframe, setSelectedKeyframe] = useState<number>(0);
  // const [trackedKeyframe, setTrackedKeyframe] = useState<number>(0);

  const [newAnimationName, setNewAnimationName] = useState("");
  const [currKeyframe, setCurrKeyframe] = useState<any>();
  const [parser, setParser] = useState<any>();
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [animationProperties, setAnimationProperties] = useState({
    duration: "1",
    timingFunction: "linear",
    iterationCount: "infinite",
    direction: "normal",
  });
  const [tl, setTl] = useState<gsap.core.Timeline | null>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderTracking, setSliderTracking] = useState(false);
  const [tlActive, setTlActive] = useState(false);
  const timelineContainerRef = React.useRef<HTMLDivElement | null>(null);
  const keyframeEditorRef = React.useRef<HTMLDivElement | null>(null);
  const [animModalOpen, setAnimModal] = useState(false);
  const [animModalTab, setAnimModalTab] = useState("manage");
  const [modalFlipState, setModalFlipState] = useState(null);
  const [modalLoaded, setModalLoaded] = useState(false);
  const [keyframeEditorProps, setKeyframeEditorProps] = useState({
    property: "",
    value: "",
  });

  // library init
  gsap.registerPlugin(useGSAP, Flip, CustomEase);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // Create timeline container for portal and append to .gjs-editor
    const timelineContainer = document.createElement("div");
    timelineContainer.className = "timeline-bar";
    timelineContainerRef.current = timelineContainer;
    document.querySelector(".gjs-editor")?.appendChild(timelineContainer);

    // create keyframe editor container for portal and append to .gjs-editor
    const keyframeEditor = document.createElement("div");
    // keyframeEditor.className = "keyframe-editor";
    keyframeEditorRef.current = keyframeEditor;
    document.querySelector(".gjs-editor")?.appendChild(keyframeEditor);

    if (!parser && editor) {
      const origParser = editor.Parser.getConfig();
      setParser(origParser);
      editor.setCustomParserCss(keyframeParser);
    }

    editor.on("component:selected", (component) => {
      if (component.getName() != "Body") {
        setSelectedElement(component);
      }
    });

    return () => {
      if (timelineContainerRef.current) {
        timelineContainerRef.current.remove();
      }
      if (keyframeEditorRef.current) {
        keyframeEditorRef.current.remove();
      }
    };
  }, []);

  // Set flip state for modal when it loads
  useEffect(() => {
    if (!modalFlipState && modalLoaded) {
      setModalFlipState(Flip.getState(".anim-modal"));
    }
  }, [modalLoaded]);

  //Automatically parse fill for selected animation
  useEffect(() => {
    if (selectedAnimation) {
      parseFill(selectedAnimation);
      if (animModalTab != "edit") {
        setAnimModalTab("edit");
      }
      if (!tl) {
        setTriggerMessage({
          type: "info",
          content: `Animation: "${selectedAnimation}" has been loaded!`,
        });
        // turn on and populate timeline
        setTlActive(true);
        dispatch(setSelectedKeyframe(0));
        setCurrKeyframe(keyframes[0]);
      }
    }
  }, [selectedAnimation]);

  //updates current keyframe
  useEffect(() => {
    if (keyframes) {
      setCurrKeyframe(keyframes[selectedKeyframe]);
    }
  }, [keyframes, animations, selectedKeyframe]);

  // Stop timeline if no element is selected
  useEffect(() => {
    if (selectedElement) {
      // setAnimationProperties(selectedElement.get("animation"));
      setTlActive(true);
    } else {
      setTlActive(false);
    }
  }, [selectedElement]);

  useEffect(() => {
    switch (triggerMessage.type) {
      case "info":
        messageApi.info(triggerMessage.content);
        break;
      case "warning":
        messageApi.warning(triggerMessage.content);
        break;
      case "success":
        messageApi.success(triggerMessage.content);
        break;
      case "error":
        messageApi.error(triggerMessage.content);
        break;
      default:
        break;
    }
  }, [triggerMessage]);

  useEffect(() => {
    if (keyframeEditorProps.property) {
      handlePropertyChange(
        keyframeEditorProps.property,
        keyframeEditorProps.value
      );
    }
    if (selectedElement) {
      const prop = keyframeEditorProps.property;
      const val = keyframeEditorProps.value;
      gsap.set(selectedElement.view.el, { [prop]: val });
    }
  }, [keyframeEditorProps]);

  // Flip animation modal
  useGSAP(() => {
    if (modalFlipState) {
      if (animModalOpen) {
        openModal();
      } else {
        closeModal();
      }
    }
  }, [animModalOpen]);

  // Update slider value
  useGSAP(() => {
    var sliderDebounceTimer: NodeJS.Timeout | null = null;

    const updateSliderValue = () => {
      if (tl) {
        const roundedValue = Math.round(tl.progress() * 100);
        sliderDebounceTimer = setTimeout(() => {
          // update the slider value
          setSliderValue(roundedValue);
          dispatch(setTrackedKeyframe(roundedValue));
        }, 50);
      }
    };

    if (tl) {
      // allow animation to update the slider position
      tl.eventCallback("onUpdate", updateSliderValue);
    }

    return () => {
      if (sliderDebounceTimer) {
        clearTimeout(sliderDebounceTimer);
      }
    };
  }, [tl, sliderValue]);

  // timeline handler
  useGSAP(() => {
    // Update the animation when dependency states change
    let totalDuration = parseFloat(animationProperties.duration);
    if (tlActive && selectedElement && selectedAnimation) {
      if (tl) {
        // tl.revert();
        // tl.kill();
      }

      setTriggerMessage({
        type: "info",
        content: "Creating new timeline!",
      });

      let options = {
        repeat:
          animationProperties.iterationCount == "infinite"
            ? -1
            : parseInt(animationProperties.iterationCount),
        yoyo: animationProperties.direction == "alternate" ? true : false,
      };
      const convertedEase = getGSAPEase(animationProperties.timingFunction);

      // Deep clone keyframes to prevent mutation of the state
      const clonedKeyframes = JSON.parse(JSON.stringify(keyframes));

      const entries = JSON.parse(JSON.stringify(clonedKeyframes));
      const keyframeEntries: any = Object.entries(entries);

      const timeline = gsap.timeline({
        ...options,
        paused: true,
      });

      if (animationProperties.direction == "reverse") {
        timeline.reverse();
      }

      Object.entries(clonedKeyframes).forEach(
        ([percentage, properties]: any, index, array) => {
          // the correct tweening would look like parseFloat(prevPercentage) / 100 * totalDuration
          // but we are using the same tweening css uses
          if (index === 0) {
            timeline.set(selectedElement.view.el, properties);
          } else {
            const prevPercentage = array[index - 1][0];
            const time = (parseFloat(prevPercentage) / 100) * totalDuration;
            const segmentDuration =
              ((parseFloat(percentage) - parseFloat(prevPercentage)) / 100) *
              totalDuration;
            timeline.to(
              selectedElement.view.el,
              {
                ...properties,
                duration: segmentDuration,
                ease: convertedEase,
                startAt: { ...keyframeEntries[index - 1][1] },
              }
            );
          }
        }
      );

      setTl(timeline);
    } else if (tl) {
      setTriggerMessage({
        type: "alert",
        content: "Clearing timeline...",
      });
      // reset the timeline if no element is selectedSS
      tl.revert();
      tl.kill();
      setTl(null);
    } else {
      setTriggerMessage({
        type: "alert",
        content: "Timeline is inactive!",
      });
    }

    return () => {
      if (tl) {
        tl.revert();
      }
    };
  }, [
    tlActive,
    selectedElement,
    selectedAnimation,
    animationProperties,
    keyframes,
  ]);

  useGSAP(() => {
    // display the selected keyframe when the timeline is inactive
    if (selectedAnimation && selectedElement) {
      // if the props are set at the current keyframe
      if (keyframes[selectedKeyframe]) {
        if ((tl && !tl.isActive()) || !tl) {
          // display the selected keyframe
          gsap.set(selectedElement.view.el, { ...keyframes[selectedKeyframe] });
        }
      } else {
        // if the props are not set at the current keyframe
        if (tl && !tl.isActive()) {
          // seek to the current keyframe if the timeline exists
          tl.seek((sliderValue / 100) * tl.duration());
        } else {
          // or create the timeline if it doesn't
          setTlActive(true);
        }
      }
      setSliderTracking(false);
    }
  }, [keyframes, selectedKeyframe]);

  useGSAP(() => {
    // display the selected keyframe when the timeline is active but paused
    if (selectedAnimation && selectedElement && sliderTracking) {
      // if the props are set at the current keyframe
      if (keyframes[trackedKeyframe]) {
        if ((tl && !tl.isActive()) || !tl) {
          // display the selected keyframe
          gsap.to(selectedElement.view.el, { ...keyframes[trackedKeyframe] });
        }
      } else {
        // if the props are not set at the current keyframe
        if (tl && !tl.isActive()) {
          // seek to the current keyframe if the timeline exists
          tl.seek((sliderValue / 100) * tl.duration());
        } else {
          // or create the timeline if it doesn't
          setTlActive(true);
        }
      }
    }
  }, [keyframes, trackedKeyframe]);

  const handleAnimationChange = (e: any) => {
    dispatch(setSelectedAnimation(e));
  };

  //Hack to allow keyframeEditor to use most recent state
  const keyframeEditorUpdate = (property: any, value: any) => {
    setKeyframeEditorProps({ property: property, value: value });
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

          // regex for seperating the properties
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
      dispatch(setKeyframes(objectFrames));
      setCurrKeyframe(objectFrames[selectedKeyframe]);
    }
  };

  //Custom parser for grapesjs
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
    if (newAnimationName && !animations.includes(newAnimationName)) {
      const css = `@keyframes ${newAnimationName} {
          0% { opacity: 1; }
          100% { opacity: 1; }
        }`;
      editor.CssComposer.addRules(css);
      //add the animation to the animations array
      dispatch(setAnimations([...animations, newAnimationName]));
      //clear the input
      setNewAnimationName("");
      //select the new animation
      dispatch(setSelectedAnimation(newAnimationName));
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

    //  Update or add the keyframe if it doesn't exist
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
    if (
      Object.keys(updatedKeyframes[selectedKeyframe]).length === 0 &&
      selectedKeyframe !== 0 &&
      selectedKeyframe !== 100
    ) {
      delete updatedKeyframes[selectedKeyframe];
    } else if (Object.keys(updatedKeyframes[selectedKeyframe]).length === 0) {
      if (selectedKeyframe == 0 || selectedKeyframe == 100) {
        setTriggerMessage({
          type: "warning",
          content: "First and last keyframes cannot be empty",
        });
      }
    }

    dispatch(setKeyframes(updatedKeyframes));

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

    setTlActive(false);
    setSliderTracking(false);
  };
  // Converts css timing-function to GSAP easings
  const getGSAPEase = (timingFunction) => {
    switch (timingFunction) {
      case "ease":
        return CustomEase.create("ease", "M0,0 C0.25,0.1 0.25,1 1,1");
      case "ease-in":
        return "power1.in";
      case "ease-out":
        return "power1.out";
      case "ease-in-out":
        return CustomEase.create("easeinout", "M0,0 C0.42,0 0.58,1 1,1");
      case "linear":
        return "linear";
      default:
        if (timingFunction.startsWith("cubic-bezier")) {
          // untested
          const values = timingFunction
            .match(/cubic-bezier\(([^)]+)\)/)[1]
            .split(",")
            .map(parseFloat);
          if (values.length === 4) {
            return CustomEase.create(
              "customCubicBezier",
              `M0,0 C${values.join(" ")} 1,1`
            );
          }
        }
        return "none"; // Default to linear if no match
    }
  };

  const playAnimation = () => {
    if (tl && tlActive) {
      // pickup where pause left off
      tl.play();
    } else {
      // Create / Update the timeline
      setTlActive(true);
    }
  };

  const pauseAnimation = () => {
    if (tl) {
      tl.pause();
      setTlActive(false);
    }
  };

  const handleAnimPropChange = (newAnimationProperties) => {
    setAnimationProperties(newAnimationProperties);
    //stop the animation from updating but don't pause it
    setTlActive(false);
  };

  // Update the properties on a playing animation
  const animPropChangeUpdate = () => {
    if (tl) {
      tl.pause();
      setTlActive(true);
    }
  };

  const handlePlayPauseAnimation = () => {
    if (tl && tl.isActive()) {
      pauseAnimation();
    } else {
      playAnimation();
    }
  };

  const handleScrubAnimation = (value: number) => {
    if (tl && !tl.isActive()) {
      // Slider scrubs through the timeline if it is paused
      // Slider Updates it's own state
      setSliderValue(value);
      // Slider updates the tracked keyframe
      dispatch(setTrackedKeyframe(value));
      setSliderTracking(true);
    } else {
      // Check if tl exists
      if (tl) {
        // Pause animation if it exists so we can scrub through it
        pauseAnimation();
      }
      // Slider updates it's own state
      setSliderValue(value);
      // Slider updates the tracked keyframe
      dispatch(setTrackedKeyframe(value));
      setSliderTracking(true);
    }
  };

  const handleSelectedAnimation = (animation) => {
    if (animation === selectedAnimation) {
      setAnimModalTab("edit");
    } else dispatch(setSelectedAnimation(animation));
  };

  const prepareElement = useCallback(() => {
    if (keyframes[selectedKeyframe]) {
      gsap.set(selectedElement.view.el, { ...keyframes[selectedKeyframe] });
    }
  }, [keyframes, selectedKeyframe, selectedElement]);

  const items: TabsProps["items"] = [
    {
      key: "manage",
      label: "Manage",
      children: (
        <>
          <List
            style={{
              minHeight: "180px",
              marginRight: "10px",
              marginLeft: "10px",
              marginBottom: "10%",
              background: "#41425775",
              borderRadius: "15px",
              overflowY: "auto",
            }}
            itemLayout="horizontal"
            dataSource={animations as string[]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a className="fa fa-trash" key="list-delete" />,
                  <a
                    onClick={() => {
                      handleSelectedAnimation(item);
                    }}
                    className="fa fa-pencil"
                    key="list-edit"
                  />,
                ]}
              >
                <Skeleton
                  active
                  loading={false}
                  title={false}
                  paragraph={{ rows: 1 }}
                >
                  <List.Item.Meta title={<div>{item}</div>} />
                </Skeleton>
              </List.Item>
            )}
          />
          <div className="p-2">
            <Input
              className="mb-2"
              type="text"
              value={newAnimationName}
              onChange={(e) => setNewAnimationName(e.target.value)}
              onPressEnter={handleAddAnimation}
              placeholder="New Animation Name"
            />
            <Button onClick={handleAddAnimation}>Add Animation</Button>
          </div>
        </>
      ),
    },
    {
      key: "edit",
      label: "Edit",
      children: (
        <>
          <div className="mb-2">
            <label>Select Animation:</label>
            <Select
              style={{ width: "60%" }}
              dropdownStyle={{ width: "fit-content" }}
              onChange={handleAnimationChange}
              value={selectedAnimation}
            >
              <option value="">Select Animation</option>
              {animations.map((anim, index) => (
                <option key={index} value={anim}>
                  {anim}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="anim-modal-section">
              <label>Duration:</label>
              <InputNumber
                style={{ width: "40%" }}
                value={animationProperties.duration}
                onPressEnter={animPropChangeUpdate}
                onChange={(value) =>
                  handleAnimPropChange({
                    ...animationProperties,
                    duration: value,
                  })
                }
              />
            </div>
            <div className="anim-modal-section">
              <label>Timing Function:</label>
              <Select
                style={{ width: "fit-content" }}
                dropdownStyle={{ width: "fit-content" }}
                value={animationProperties.timingFunction}
                options={[
                  { value: "linear", label: "Linear" },
                  { value: "ease", label: "Ease" },
                  { value: "ease-in", label: "Ease In" },
                  { value: "ease-out", label: "Ease Out" },
                  { value: "ease-in-out", label: "Ease In Out" },
                ]}
                onChange={(value) => {
                  handleAnimPropChange({
                    ...animationProperties,
                    timingFunction: value,
                  });
                }}
              />
            </div>
            <div className="anim-modal-section">
              <label>Iteration Count:</label>
              <InputNumber
                style={{ width: "40%" }}
                value={
                  animationProperties.iterationCount == "infinite"
                    ? "∞"
                    : animationProperties.iterationCount
                }
                addonAfter={
                  <button
                    onClick={(value) =>
                      handleAnimPropChange({
                        ...animationProperties,
                        iterationCount: "infinite",
                      })
                    }
                  >
                    ∞
                  </button>
                }
                onPressEnter={animPropChangeUpdate}
                onChange={(value) =>
                  handleAnimPropChange({
                    ...animationProperties,
                    iterationCount: value,
                  })
                }
              />
            </div>
            <div className="anim-modal-section">
              <label>Direction:</label>
              <Select
                style={{ width: "fit-content" }}
                dropdownStyle={{ width: "fit-content" }}
                value={animationProperties.direction}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "reverse", label: "Reverse" },
                  { value: "alternate", label: "Alternate" },
                  { value: "alternate-reverse", label: "Alternate Reverse" },
                ]}
                onChange={(value) =>
                  handleAnimPropChange({
                    ...animationProperties,
                    direction: value,
                  })
                }
              />
            </div>
          </div>
          <div
            className="flex flex-col items-center mb-2 p-2"
            style={{ background: "#41425775" }}
          >
            <span className="mb-2">
              Selected Element:{" "}
              {selectedElement ? selectedElement.getName() : "None"}
            </span>
            <div className="flex flex-row space-x-1">
              <Button
                style={{ flexGrow: 1 }}
                onClick={() => setSelectedElement(null)}
              >
                Clear Selection
              </Button>
              <Button
                style={{ width: "20%" }}
                onClick={handlePlayPauseAnimation}
              >
                {tl && tl.isActive() ? (
                  <a className="fa fa-pause"></a>
                ) : (
                  <a className="fa fa-play"></a>
                )}
              </Button>
            </div>
          </div>
        </>
      ),
    },
  ];

  const openModal = () => {
    // const modalContainer = document.createElement("div");
    // modalContainer.className = "anim-modal-wrapper p-2 h-full";
    // animModalRef.current.appendChild(modalContainer);
    // ReactDOM.createPortal(modalContent, modalContainer);

    Flip.from(modalFlipState, {
      duration: 0.7,
      ease: "elastic.out(1,0.4)",
      absolute: true,
      scale: true,
    });
  };

  const closeModal = () => {
    Flip.from(modalFlipState, {
      duration: 0.5,
      ease: "power1.inOut",
      absolute: true,
      scale: true,
    });
  };

  return (
    <div>
      {contextHolder}
      <h4>Animation Panel</h4>
      <div className="panel__animations">
        {ANIMATABLE_PROPERTIES.map((prop, index) => (
          <div
            key={index}
            className="flex-col mb-2 p-2 items-center text-sky-300"
          >
            <div className="flex-grow capitalize">{prop}</div>
            <Input
              value={
                // Find the value for the selected keyframe and property
                currKeyframe && currKeyframe[prop] ? currKeyframe[prop] : ""
              }
              onChange={(e) => handlePropertyChange(prop, e.target.value)}
            />
          </div>
        ))}
      </div>
      {timelineContainerRef.current &&
        ReactDOM.createPortal(
          <>
            <div className="timeline-header">
              <div className="timeline-title self-center text-lg">Timeline</div>
              <div
                ref={() => setModalLoaded(true)}
                className={
                  animModalOpen
                    ? "anim-modal anim-open"
                    : "anim-modal anim-closed"
                }
              >
                {animModalOpen ? (
                  <div className="anim-modal-wrapper p-2 h-full">
                    <div className="anim-modal-header flex flex-row justify-center">
                      <div className="anim-modal-title ">Animation Manager</div>
                      <button
                        style={{
                          position: "absolute",
                          right: 0,
                          marginRight: 20,
                        }}
                        className="anim-modal-close"
                        onClick={() => setAnimModal(false)}
                      >
                        X
                      </button>
                    </div>
                    <Tabs
                      activeKey={animModalTab}
                      onTabClick={(key) => setAnimModalTab(key)}
                      style={{ height: "50%" }}
                      items={items}
                      tabBarGutter={24}
                      centered={true}
                    />
                  </div>
                ) : (
                  <FloatButton
                    style={{ position: "absolute", right: 0, bottom: 0 }}
                    tooltip={<div>Open Animation Manager</div>}
                    onClick={() => setAnimModal(true)}
                  />
                )}
              </div>
            </div>
            <div>
              <Slider
                value={sliderValue}
                onChange={handleScrubAnimation}
                min={0}
                max={100}
              />
            </div>
            <div className="timeline-content">
              <div className="timeline-wrapper">
                {Array.from({ length: 101 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      ...(index == 0
                        ? { borderLeft: "1px solid #b9a5a6" }
                        : {}),
                    }}
                    className={`timeline-section ${
                      selectedKeyframe === index ? "frame-selected" : ""
                    } ${trackedKeyframe === index ? "timeline-tracker" : ""} ${
                      keyframes && keyframes[index] ? "hasstyle" : ""
                    }`}
                    onClick={() => dispatch(setSelectedKeyframe(index))}
                  >
                    {selectedKeyframe === index ? <span>{index}%</span> : null}
                  </div>
                ))}
              </div>
            </div>
          </>,
          timelineContainerRef.current
        )}
      {selectedElement &&
        selectedAnimation &&
        ReactDOM.createPortal(
          keyframeEditorRef.current && (
            <KeyframeEditor
              selectedElement={selectedElement}
              onTransformChange={keyframeEditorUpdate}
              prepareElement={prepareElement}
            />
          ),
          keyframeEditorRef.current
        )}
    </div>
  );
}

export default AnimationPanel;
