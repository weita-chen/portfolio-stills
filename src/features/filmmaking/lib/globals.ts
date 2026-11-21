export type FilmPending = { lang: string; slug: string };

declare global {
  interface Window {
    __filmReady?: boolean;
    __filmPending?: FilmPending | null;
    __filmGesture?: number;
    __filmMenu?: boolean;
  }
}
