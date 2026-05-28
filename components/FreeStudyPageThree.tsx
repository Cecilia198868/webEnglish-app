"use client";

type FreeStudyPageThreeProps = {
  chineseText: string;
  avatarSrc?: string;
  avatarAlt?: string;
  accountLabel?: string;
  menuLabel?: string;
  onEditChinese: (value: string) => void;
  onRetryChinese: () => void;
  onStartEnglishPractice: () => void;
  onAccountClick?: () => void;
  onAvatarError?: () => void;
  onMenuClick?: () => void;
};

export default function FreeStudyPageThree({
  chineseText,
  avatarSrc = "",
  avatarAlt = "user",
  accountLabel = "Open account",
  menuLabel = "Open menu",
  onEditChinese,
  onRetryChinese,
  onStartEnglishPractice,
  onAccountClick,
  onAvatarError,
  onMenuClick,
}: FreeStudyPageThreeProps) {
  return (
    <section className="sf-free-study-page-three" aria-label="Confirm Chinese expression">
      <div className="sf-free-study-page-three-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/freestudy%203.png"
          alt=""
          aria-hidden="true"
          className="sf-free-study-page-three-bg"
          draggable={false}
        />

        <button
          type="button"
          aria-label={menuLabel}
          onClick={onMenuClick}
          className="sf-free-study-page-three-menu"
        />

        <button
          type="button"
          aria-label={accountLabel}
          onClick={onAccountClick}
          className="sf-free-study-page-three-avatar-button"
          title={avatarAlt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc || "/default-avatar.png"}
            alt=""
            className="sf-free-study-page-three-avatar-image"
            onError={onAvatarError}
          />
        </button>

        <label className="sf-free-study-page-three-text-wrap">
          <span className="sr-only">Edit recognized Chinese</span>
          <textarea
            aria-label="Edit recognized Chinese"
            lang="zh-CN"
            value={chineseText}
            onChange={(event) => onEditChinese(event.target.value)}
            className="sf-free-study-page-three-textarea"
          />
        </label>

        <button
          type="button"
          aria-label="Retry Chinese recording"
          onClick={onRetryChinese}
          className="sf-free-study-page-three-retry"
        />

        <button
          type="button"
          aria-label="Confirm and start English practice"
          onClick={onStartEnglishPractice}
          disabled={!chineseText.trim()}
          className="sf-free-study-page-three-confirm"
        />
      </div>
    </section>
  );
}
