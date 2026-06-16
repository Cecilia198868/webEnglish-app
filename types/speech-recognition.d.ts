export {};

declare global {
  interface SpeechRecognitionAlternativeLike {
    transcript?: string;
  }

  interface SpeechRecognitionResultLike {
    [index: number]: SpeechRecognitionAlternativeLike | undefined;
    isFinal?: boolean;
  }

  interface SpeechRecognitionResultEventLike extends Event {
    resultIndex?: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
  }

  interface SpeechRecognitionErrorEventLike extends Event {
    error?: string;
    message?: string;
  }

  interface BrowserSpeechRecognition {
    abort: () => void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
    onspeechend?: (() => void) | null;
    onspeechstart?: (() => void) | null;
    start: () => void;
    stop: () => void;
  }

  type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
