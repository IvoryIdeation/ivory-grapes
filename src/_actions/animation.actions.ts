import { animationConstants } from "../_constants";

// actions.ts

export const setAnimations = (animations: string[]) => ({
  type: animationConstants.SET_ANIMATIONS,
  payload: animations,
});

export const setSelectedAnimation = (selectedAnimation: string) => ({
  type: animationConstants.SET_SELECTED_ANIMATION,
  payload: selectedAnimation,
});

export const setKeyframes = (keyframes: any) => ({
  type: animationConstants.SET_KEYFRAMES,
  payload: keyframes,
});

export const setSelectedKeyframe = (selectedKeyframe: number) => ({
  type: animationConstants.SET_SELECTED_KEYFRAME,
  payload: selectedKeyframe,
});

export const setTrackedKeyframe = (trackedKeyframe: number) => ({
  type: animationConstants.SET_TRACKED_KEYFRAME,
  payload: trackedKeyframe,
});

export const setSliderValue = (sliderValue: number) => ({
  type: animationConstants.SET_SLIDER_VALUE,
  payload: sliderValue,
});

export const setSliderTracking = (sliderTracking: boolean) => ({
  type: animationConstants.SET_SLIDER_TRACKING,
  payload: sliderTracking,
});
