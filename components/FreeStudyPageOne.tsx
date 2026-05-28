"use client";

type FreeStudyPageOneProps = {
  accountLabel?: string;
  avatarAlt?: string;
  avatarSrc?: string;
  menuLabel?: string;
  onAccountClick: () => void;
  onAvatarError?: () => void;
  onMenuClick: () => void;
  onMicrophoneClick: () => void;
};

export default function FreeStudyPageOne({
  accountLabel = "Open account",
  avatarAlt = "user",
  avatarSrc = "",
  menuLabel = "Open menu",
  onAccountClick,
  onAvatarError,
  onMenuClick,
  onMicrophoneClick,
}: FreeStudyPageOneProps) {
  return (
    <section className="sf-free-study-page-one" aria-label="Free study step one">
      <div className="sf-free-study-page-one-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
            src="/images/freestudy%201.png"
  alt=""
  aria-hidden="true"
  className="sf-free-study-page-one-bg"
  draggable={false}
  sizes="100vw"
        />

        <button
          type="button"
          aria-label={menuLabel}
          onClick={onMenuClick}
          className="sf-free-study-page-one-menu"
        />

        <button
  type="button"
  aria-label={accountLabel}
  onClick={onAccountClick}
  className="sf-free-study-page-one-avatar-button"
  title={avatarAlt}
>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src={avatarSrc || "/default-avatar.png"}
    alt=""
    className="sf-free-study-page-one-avatar-image"
    onError={onAvatarError}
  />
</button>

        <button
          type="button"
          aria-label="Start free study recording"
          onClick={onMicrophoneClick}
          className="sf-free-study-page-one-mic"
        />
      </div>
    </section>
  );
}
