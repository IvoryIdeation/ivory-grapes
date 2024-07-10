import React, { useEffect, useRef, useState } from "react";
import { gsap, Draggable } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { useEditor } from "@grapesjs/react";
import { useSelector, useDispatch } from "react-redux";
import VerEx from "verbal-expressions";

interface KeyframeEditorProps {
  selectedElement: any;
  onTransformChange: (property: string, value: string) => void;
  prepareElement: (keyframes: any) => void;
}

const KeyframeEditor: React.FC<KeyframeEditorProps> = ({
  selectedElement,
  onTransformChange,
  prepareElement,
}) => {
  const [transform, setTransform] = useState({
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    translateX: 0,
    translateY: 0,
  });
  const [originalProps, setOriginalProps] = useState({});
  const [outputProps, setOutputProps] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });
  const [previewString, setPreviewString] = useState(""); // used for previewing position
  const [transformString, setTransformString] = useState("");
  const transDiffRef = useRef(null);
  const cloneRef = useRef(null);
  const transformRef = useRef(null);
  const draggableRef = useRef<Draggable | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const initialPosition = useRef<{ x: number; y: number } | null>(null);
  const editor = useEditor();
  const { keyframes, selectedKeyframe, trackedKeyframe } = useSelector(
    (state: any) => state.animation
  );
  gsap.registerPlugin(useGSAP, Draggable);

  useEffect(() => {
    if (selectedElement && boxRef.current) {
      // Destroy the existing Draggable instance when the selected element changes
      draggableRef.current?.kill();

      const element = selectedElement.view.el;

      // Hide original grapes selector styling
      element.style.setProperty("outline", "none", "important");
      const resizer = document.querySelector(".gjs-resizer") as HTMLDivElement;
      resizer.style.display = "none";

      const { top, left, width, height } = element.getBoundingClientRect();
      boxRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      boxRef.current.style.width = `${width}px`;
      boxRef.current.style.height = `${height}px`;

      const props = {
        width: width,
        height: height,
        left: left,
        top: top,
        right: left + width,
        bottom: top + height,
      };
      // We will update output props and compare against original props,
      // returning the changed props to AnimationPanel
      setOriginalProps(props);
      setOutputProps(props);

      draggableRef.current = new Draggable(boxRef.current, {
        type: "x,y",
        allowEventDefault: true,
        // bounds: {top: 0, left: -20, width: boxRef.current.parentElement!.offsetWidth + 20},
        onPressInit: function () {
          // if (keyframes[selectedKeyframe]) {
          //   gsap.set(selectedElement.view.el, {
          //     ...keyframes[selectedKeyframe],
          //   });
          // }
          const { top, left } = element.getBoundingClientRect();
          gsap.set(this.target, { x: left, y: top });
        },
        onDrag: function (e) {
          e.preventDefault();

          // gsap.set(element, { x: this.x, y: this.y });
          // const diffX = element.getBoundingClientRect().left - this.x;
          // const diffY = element.getBoundingClientRect().top - this.y;
          // if (diffY > 0 || diffX > 0) {
          // gsap.set(element, { x: this.x - diffX, y: this.y - diffY });
          // }
          handleDrag(this);
        },
        onDragEnd: () => {},
        x: left,
        y: top,
      });

      return () => {
        draggableRef.current?.kill();
        gsap.to(element, { transform: "none" });
        element.style.removeProperty("transform");
        element.style.removeProperty("outline");
        resizer.style.display = "block";
        boxRef.current?.style.removeProperty("transform");
        transDiffRef.current = null;
        cloneRef.current?.remove();
        cloneRef.current = null;
      };
    }
  }, [selectedElement]);

  useEffect(() => {
    const { top, left, width, height } =
      selectedElement.view.el.getBoundingClientRect();
    boxRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    boxRef.current.style.width = `${width}px`;
    boxRef.current.style.height = `${height}px`;
  }, [selectedKeyframe]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useGSAP(() => {
    if (selectedElement) {
      // gsap.to(selectedElement.view.el, {
      //   duration: 0,
      //   transform: transformString,
      // });

      const { left, top, width, height } =
        selectedElement.view.el.getBoundingClientRect();
      gsap.set(boxRef.current, {
        x: left,
        y: top,
        width: width,
        height: height,
      });
    }
  }, [previewString]);

  const handleDrag = (drag) => {
    const element = selectedElement.view.el;
    if (!cloneRef.current) {
      const { left, top } = element.getBoundingClientRect();
      const cloneElement = element.cloneNode(true);
      // cloneElement.style.left = `${left}px`;
      // cloneElement.style.top = `${top}px`;
      cloneElement.style.opacity = 0;
      cloneElement.style.position = "absolute";
      cloneElement.style.transform = `translate3d(${drag.x}px, ${drag.y}px, 0)`;
      element.insertAdjacentElement("beforebegin", cloneElement);
      cloneRef.current = cloneElement;
    }
    gsap.set(cloneRef.current,  { x: drag.x, y: drag.y});
    const diffX = cloneRef.current.getBoundingClientRect().left - drag.x;
    const diffY = cloneRef.current.getBoundingClientRect().top - drag.y;
    // gsap.set(cloneRef.current,  { x: drag.x, y: drag.y - diffY});

    const newTransform = { ...transformRef.current };
    if (diffY > 0) {
      newTransform.translateY = drag.y - diffY;
    } else {
      newTransform.translateY = drag.y;
    }
    newTransform.translateX = drag.x;

    setTransform(newTransform);

    const newTransformString = generateTransformString(newTransform);
    onTransformChange("transform", newTransformString);
  };

  const handleDragEnd = () => {
    // You can add any additional logic here if needed
  };

  const handleMouseMove = (type: string) => (event: MouseEvent) => {
    if (!initialPosition.current || !boxRef.current) return;

    const { x: initialX, y: initialY } = initialPosition.current;
    const { top, left, width, height } = boxRef.current.getBoundingClientRect();

    const deltaX = event.clientX - initialX;
    const deltaY = event.clientY - initialY;

    // calaculate the new transform

    let newTransform = { ...transform };

    switch (type) {
      case "translateX":
        newTransform.translateX += deltaX;
        break;
      case "translateY":
        newTransform.translateY += deltaY;
        break;
      case "scaleX":
        newTransform.scaleX += deltaX / (width / 2);
        break;
      case "scaleY":
        newTransform.scaleY += deltaY / (height / 2);
        break;
      case "rotate":
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const initialAngle = Math.atan2(initialY - centerY, initialX - centerX);
        const currentAngle = Math.atan2(
          event.clientY - centerY,
          event.clientX - centerX
        );
        const angleDelta = (currentAngle - initialAngle) * (180 / Math.PI);
        newTransform.rotate += angleDelta;
        break;
    }

    setTransform(newTransform);

    const newTransformString = generateTransformString(newTransform);
    setPreviewString(newTransformString);
    onTransformChange("transform", newTransformString);
  };

  const handleMouseUp =
    (handleMouseMoveWrapper: (event: MouseEvent) => void) => () => {
      document.removeEventListener("mousemove", handleMouseMoveWrapper);
      document.removeEventListener(
        "mouseup",
        handleMouseUp(handleMouseMoveWrapper)
      );

      event.target.removeEventListener("dragstart", handleDragStart);
      // Remove the no-select class after dragging ends
      document.body.classList.remove("no-select");
      draggableRef.current.enable();
    };

  const handleDragStart = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleMouseDown = (type: string) => (event: React.MouseEvent) => {
    draggableRef.current.disable();
    initialPosition.current = { x: event.clientX, y: event.clientY };
    const handleMouseMoveWrapper = handleMouseMove(type);

    document.addEventListener("mousemove", handleMouseMoveWrapper);
    document.addEventListener("mouseup", handleMouseUp(handleMouseMoveWrapper));
    event.target.addEventListener("dragstart", handleDragStart);
    // Add the no-select class to the body to prevent text selection
    document.body.classList.add("no-select");
  };

  const generateTransformString = (newTransform: any) => {
    let transformParts = [];

    // Handle translation
    if (newTransform.translateX !== 0 || newTransform.translateY !== 0) {
      if (newTransform.translateX !== 0 && newTransform.translateY !== 0) {
        transformParts.push(
          `translate(${newTransform.translateX.toFixed(
            2
          )}px, ${newTransform.translateY.toFixed(2)}px)`
        );
      } else if (
        newTransform.translateX !== 0 &&
        newTransform.translateY == 0
      ) {
        transformParts.push(
          `translateX(${newTransform.translateX.toFixed(2)}px)`
        );
      } else if (
        newTransform.translateY !== 0 &&
        newTransform.translateX == 0
      ) {
        transformParts.push(
          `translateY(${newTransform.translateY.toFixed(2)}px)`
        );
      }
    }

    // Handle rotation
    if (newTransform.rotate !== 0) {
      transformParts.push(
        `rotate(${parseFloat(newTransform.rotate).toFixed(2)}deg)`
      );
    }

    // Handle scaling
    if (newTransform.scaleX !== 1 || newTransform.scaleY !== 1) {
      if (newTransform.scaleX !== 1 && newTransform.scaleY !== 1) {
        // if both scaleX and scaleY are not 1, combine them using scale(x, y)
        transformParts.push(
          `scale(${newTransform.scaleX.toFixed(
            2
          )}, ${newTransform.scaleY.toFixed(2)})`
        );
      } else {
        // find out which scale value has changed and add it to the string
        if (newTransform.scaleX !== 1) {
          transformParts.push(`scaleX(${newTransform.scaleX.toFixed(2)})`);
        } else if (newTransform.scaleY !== 1) {
          transformParts.push(`scaleY(${newTransform.scaleY.toFixed(2)})`);
        }
      }
    }

    // Combine all transformations
    const newTransformString = transformParts.join(" ");

    setTransformString(newTransformString);
    return newTransformString;
  };

  const clearKeyframe = () => {
    onTransformChange("transform", "");
    setTransformString("");
    setPreviewString("");
    const transformDefaults = {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
      translateX: 0,
      translateY: 0,
    };
    transformRef.current = transformDefaults;
    cloneRef.current?.remove();
    cloneRef.current = null;
    setTransform(transformDefaults);
    gsap.set(selectedElement.view.el, { transform: "none" });
    const { top, left } = selectedElement.view.el.getBoundingClientRect();
    gsap.set(boxRef.current, { x: left, y: top });

    // draggableRef.current.kill();
  };

  return (
    <div className="keyframe-editor" ref={boxRef}>
      <div className="keyframe-clear">
        <button onClick={clearKeyframe}>Clear</button>
      </div>
      <div className="drag-box"></div>
      {/* Inside corner handles for scaling */}
      <div
        className="handle scale top-left"
        onMouseDown={handleMouseDown("scale")}
      />
      <div
        className="handle scale top-right"
        onMouseDown={handleMouseDown("scale")}
      />
      <div
        className="handle scale bottom-left"
        onMouseDown={handleMouseDown("scale")}
      />
      <div
        className="handle scale bottom-right"
        onMouseDown={handleMouseDown("scale")}
      />

      {/* Outside corner handles for rotating */}
      <div
        className="handle rotate top-left"
        onMouseDown={handleMouseDown("rotate")}
      />
      <div
        className="handle rotate top-right"
        onMouseDown={handleMouseDown("rotate")}
      />
      <div
        className="handle rotate bottom-left"
        onMouseDown={handleMouseDown("rotate")}
      />
      <div
        className="handle rotate bottom-right"
        onMouseDown={handleMouseDown("rotate")}
      />

      {/* Inside Edge handles for scaling */}
      <div
        className="handle scale top"
        onMouseDown={handleMouseDown("scaleY")}
      />
      <div
        className="handle scale bottom"
        onMouseDown={handleMouseDown("scaleY")}
      />
      <div
        className="handle scale left"
        onMouseDown={handleMouseDown("scaleX")}
      />
      <div
        className="handle scale right"
        onMouseDown={handleMouseDown("scaleX")}
      />

      {/* Outside Edge handles for translating */}
      <div
        className="handle translate top"
        onMouseDown={handleMouseDown("translateY")}
      />
      <div
        className="handle translate bottom"
        onMouseDown={handleMouseDown("translateY")}
      />
      <div
        className="handle translate left"
        onMouseDown={handleMouseDown("translateX")}
      />
      <div
        className="handle translate right"
        onMouseDown={handleMouseDown("translateX")}
      />
    </div>
  );
};

export default KeyframeEditor;
