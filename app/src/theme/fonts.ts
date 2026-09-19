// 🔤 Typographie Niger Royal — serif élégant (façon Playfair) pour la marque et les titres
import { Platform } from 'react-native';

export const fonts = {
  /** Serif luxe — marque, titres, grandes valeurs */
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: 'Georgia, "Playfair Display", "Times New Roman", serif',
    default: 'Georgia',
  }),
  /** Sans — corps de texte (défaut système) */
  body: undefined as string | undefined,
};
