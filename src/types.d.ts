interface Window {
  webkitAudioContext: typeof AudioContext;
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}
