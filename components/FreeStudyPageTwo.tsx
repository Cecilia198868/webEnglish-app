"use client";

type FreeStudyPageTwoProps = {
  chineseText?: string;
  isRecordingChinese: boolean;
  isTranscribingChinese?: boolean;
  onMicrophoneClick: () => void;
  onGoToThirdStep?: () => void;
  userEnglishText?: string;
};

export default function FreeStudyPageTwo({
  isRecordingChinese,
  isTranscribingChinese = false,
  onMicrophoneClick,
}: FreeStudyPageTwoProps) {
  const statusText = isTranscribingChinese
    ? "正在识别你的中文..."
    : isRecordingChinese
      ? "点击麦克风结束录音"
      : "点击麦克风，说出中文";

  return (
    <section className="sf-free-study-page-two" aria-label="自由学习第二页">
      <div className="sf-free-study-page-two-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/free-study-page-2-bg.jpg"
          alt=""
          aria-hidden="true"
          className="sf-free-study-page-two-bg"
          draggable={false}
        />

        <div
          aria-hidden="true"
          className={`sf-free-study-page-two-wave ${
            isRecordingChinese ? "is-active" : ""
          }`}
        >
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <button
          type="button"
          aria-label={statusText}
          onClick={onMicrophoneClick}
          disabled={isTranscribingChinese}
          className={`sf-free-study-page-two-mic ${
            isRecordingChinese ? "is-recording" : ""
          } ${isTranscribingChinese ? "is-transcribing" : ""}`}
        />

        <p className="sf-free-study-page-two-status">{statusText}</p>
      </div>
    </section>
  );
}
