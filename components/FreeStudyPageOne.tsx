"use client";

type FreeStudyPageOneProps = {
  onMicrophoneClick: () => void;
};

export default function FreeStudyPageOne({
  onMicrophoneClick,
}: FreeStudyPageOneProps) {
  return (
    <section className="sf-free-study-page-one" aria-label="自由学习第一页">
      <div className="sf-free-study-page-one-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/free-study-page-1-bg.jpg"
          alt=""
          aria-hidden="true"
          className="sf-free-study-page-one-bg"
          draggable={false}
        />

        <button
          type="button"
          aria-label="点击麦克风开始练习"
          onClick={onMicrophoneClick}
          className="sf-free-study-page-one-mic"
        />
      </div>
    </section>
  );
}
