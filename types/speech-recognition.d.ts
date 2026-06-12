export {};

declare global {
  interface SpeechRecognitionAlternativeLike {
    transcript?: string;
  }

  interface SpeechRecognitionResultLike {
    [index: number]: SpeechRecognitionAlternativeLike | undefined;
  }

  interface SpeechRecognitionResultEventLike extends Event {
    results: ArrayLike<SpeechRecognitionResultLike>;
  }

  interface BrowserSpeechRecognition {
    abort?: () => void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: Event) => void) | null;
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
