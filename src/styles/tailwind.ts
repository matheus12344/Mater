import { create } from 'tailwind-rn';
import styles from '../../styles.json';

export const tailwind = create(styles, {
  orientation: 'portrait',
  colorScheme: 'light',
  reduceMotion: false,
  width: 375,
  height: 812
}); 