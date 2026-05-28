"use client";

type FreeStudyPageTwoProps = {
  accountLabel?: string;
  avatarAlt?: string;
  avatarSrc?: string;
  menuLabel?: string;
  chineseText?: string;
  isRecordingChinese: boolean;
  isTranscribingChinese?: boolean;
  onAccountClick?: () => void;
  onAvatarError?: () => void;
  onMenuClick?: () => void;
  onMicrophoneClick: () => void;
  onGoToThirdStep?: () => void;
  userEnglishText?: string;
};

export default function FreeStudyPageTwo({
  accountLabel = "Open account",
  avatarAlt = "user",
  avatarSrc = "",
  menuLabel = "Open menu",
  isRecordingChinese,
  isTranscribingChinese = false,
  onAccountClick,
  onAvatarError,
  onMenuClick,
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
          src="/images/freestudy%202.png"
          alt=""
          aria-hidden="true"
          className="sf-free-study-page-two-bg"
          draggable={false}
          sizes="100vw"
        />

        <button
          type="button"
          aria-label={menuLabel}
          onClick={onMenuClick}
          className="sf-free-study-page-two-menu"
        />

        <button
          type="button"
          aria-label={accountLabel}
          onClick={onAccountClick}
          className="sf-free-study-page-two-avatar-button"
          title={avatarAlt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc || "/default-avatar.png"}
            alt=""
            className="sf-free-study-page-two-avatar-image"
            onError={onAvatarError}
          />
        </button>

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