import { Dimensions, Platform } from 'react-native';

const guidelineBaseWidth = 375;
const { width, height } = Dimensions.get('window');

export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (height / guidelineBaseWidth) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;