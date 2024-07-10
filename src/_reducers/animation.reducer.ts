import { animationConstants } from "../_constants";

var initialState = {
  animations: [] as string[],
  keyframes: {},
  selectedAnimation: "",
  selectedKeyframe: 0,
  trackedKeyframe: 0,
};

export const animation = (state = initialState, action: any) => {
  switch (action.type) {
    case animationConstants.SET_ANIMATIONS:
      return { ...state, animations: action.payload };

    case animationConstants.SET_KEYFRAMES:
      return { ...state, keyframes: action.payload };

    case animationConstants.SET_SELECTED_ANIMATION:
      return { ...state, selectedAnimation: action.payload };

    case animationConstants.SET_SELECTED_KEYFRAME:
      return { ...state, selectedKeyframe: action.payload };

    case animationConstants.SET_TRACKED_KEYFRAME:
      return { ...state, trackedKeyframe: action.payload };

    default:
      return state;
  }
}
