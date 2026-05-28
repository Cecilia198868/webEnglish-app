"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

type FreeStudyPageThreeProps = {
  chineseText: string;
  onEditChinese: (value: string) => void;
  onRetryChinese: () => void;
  onStartEnglishPractice: () => void;
};

function getChineseCharacterCount(value: string) {
  return Array.from(value.replace(/\s/g, "")).length;
}

function getLineHeight(fontSizeRem: number) {
  if (fontSizeRem >= 1.72) return 1.16;
  if (fontSizeRem >= 1.52) return 1.19;
  if (fontSizeRem >= 1.32) return 1.23;
  return 1.28;
}

function getFontFitBounds(characterCount: number) {
  if (characterCount <= 18) {
    return { min: 1.24, max: 2 };
  }

  if (characterCount <= 30) {
    return { min: 1.18, max: 1.88 };
  }

  if (characterCount <= 48) {
    return { min: 1.08, max: 1.86 };
  }

  if (characterCount <= 70) {
    return { min: 1, max: 1.58 };
  }

  return { min: 0.94, max: 1.36 };
}

function applyChineseTextFit(
  textArea: HTMLTextAreaElement,
  fontSizeRem: number,
  isScrollable: boolean,
) {
  const lineHeight = getLineHeight(fontSizeRem);

  textArea.style.setProperty(
    "--sf-page-three-font-size",
    `${fontSizeRem.toFixed(3)}rem`,
  );
  textArea.style.setProperty("--sf-page-three-line-height", String(lineHeight));
  textArea.style.overflowY = isScrollable ? "auto" : "hidden";
  textArea.dataset.scrollable = isScrollable ? "true" : "false";
}

export default function FreeStudyPageThree({
  chineseText,
  onEditChinese,
  onRetryChinese,
  onStartEnglishPractice,
}: FreeStudyPageThreeProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const chineseCharacterCount = getChineseCharacterCount(chineseText);

  const fitChineseText = useCallback(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    const { min, max } = getFontFitBounds(chineseCharacterCount);

    const canFit = (fontSizeRem: number) => {
      applyChineseTextFit(textArea, fontSizeRem, false);

      return textArea.scrollHeight <= textArea.clientHeight + 1;
    };

    let low = min;
    let high = max;
    let best = min;

    if (!canFit(min)) {
      applyChineseTextFit(textArea, min, true);
      return;
    }

    for (let index = 0; index < 12; index += 1) {
      const midpoint = (low + high) / 2;
      if (canFit(midpoint)) {
        best = midpoint;
        low = midpoint;
      } else {
        high = midpoint;
      }
    }

    applyChineseTextFit(textArea, best, false);
  }, [chineseCharacterCount]);

  useLayoutEffect(() => {
    fitChineseText();
  }, [fitChineseText, chineseText]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea || typeof ResizeObserver === "undefined") return undefined;

    const resizeObserver = new ResizeObserver(() => {
      fitChineseText();
    });

    resizeObserver.observe(textArea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fitChineseText]);

  return (
    <section className="sf-free-study-page-three" aria-label="Confirm Chinese expression">
      <div className="sf-free-study-page-three-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/free-study-page-3.png"
          alt=""
          aria-hidden="true"
          className="sf-free-study-page-three-bg"
          draggable={false}
        />

        <label className="sf-free-study-page-three-text-wrap">
          <span className="sr-only">Edit recognized Chinese</span>
          <textarea
            aria-label="Edit recognized Chinese"
            lang="zh-CN"
            value={chineseText}
            onChange={(event) => onEditChinese(event.target.value)}
            rows={4}
            ref={textAreaRef}
            className="sf-free-study-page-three-textarea"
            data-scrollable="false"
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
