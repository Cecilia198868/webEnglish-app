"use client";

type FreeStudyPageFiveBottomBarProps = {
  onFavorite: () => void;
  onFollowPractice: () => void;
  onNextChinese: () => void;
  onSlowPlayback: () => void;
};

export default function FreeStudyPageFiveBottomBar({
  onFavorite,
  onFollowPractice,
  onNextChinese,
  onSlowPlayback,
}: FreeStudyPageFiveBottomBarProps) {
  return (
    <div
      className="sf-free-study-page-five-bottom-bar"
      aria-label="Free study result actions"
    >
      <div className="sf-free-study-page-five-bottom-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/free-study-page-5-bottom.jpg"
          alt=""
          aria-hidden="true"
          className="sf-free-study-page-five-bottom-image"
          draggable={false}
        />
        <button
          type="button"
          aria-label="Save current expression"
          onClick={onFavorite}
          className="sf-free-study-page-five-hit sf-free-study-page-five-favorite"
        />
        <button
          type="button"
          aria-label="Follow practice"
          onClick={onFollowPractice}
          className="sf-free-study-page-five-hit sf-free-study-page-five-follow"
        />
        <button
          type="button"
          aria-label="Start next Chinese round"
          onClick={onNextChinese}
          className="sf-free-study-page-five-hit sf-free-study-page-five-mic"
        />
        <button
          type="button"
          aria-label="Play at 0.5x speed"
          onClick={onSlowPlayback}
          className="sf-free-study-page-five-hit sf-free-study-page-five-slow"
        />
      </div>
    </div>
  );
}
