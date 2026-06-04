"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  addVocabularyWord,
  tokenizeEnglishSentence,
  updateVocabularyWord,
} from "@/lib/vocabulary";
import {
  createFallbackHighlightedExpressions,
  splitSentenceByHighlightedExpressions,
  type HighlightedExpression,
} from "@/lib/expressionHighlights";
import styles from "./InteractiveExpressionText.module.css";

type PendingExpression = {
  kind: "phrase" | "word";
  meaning: string;
  phrase: string;
  sourceSentence: string;
  statusMessage?: string;
};

type InteractiveExpressionTextProps = {
  className?: string;
  highlightClassName?: string;
  sourceSentence?: string;
  text: string;
  wordClassName?: string;
};

const defaultPhraseMeaning = "\u2728 \u503c\u5f97\u6536\u85cf\u7684\u8868\u8fbe";
const defaultWordMeaning = "\ud83d\udcd8 \u6536\u85cf\u8fd9\u4e2a\u5355\u8bcd";

function getClassName(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function isReadableMeaning(meaning: string) {
  const trimmed = meaning.trim();
  return Boolean(trimmed) && !/[\ufffd\u951f\u62f7]/.test(trimmed);
}

function normalizeClickableWord(word: string) {
  return word.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "").trim();
}

export default function InteractiveExpressionText({
  className,
  highlightClassName,
  sourceSentence,
  text,
  wordClassName,
}: InteractiveExpressionTextProps) {
  const [pendingExpression, setPendingExpression] =
    useState<PendingExpression | null>(null);
  const [isSavingExpression, setIsSavingExpression] = useState(false);
  const source = sourceSentence?.trim() || text.trim();
  const highlightedExpressions = useMemo(
    () => createFallbackHighlightedExpressions(text),
    [text]
  );
  const segments = useMemo(
    () => splitSentenceByHighlightedExpressions(text, highlightedExpressions),
    [highlightedExpressions, text]
  );

  function openPhrase(expression: HighlightedExpression, fallbackText: string) {
    const phrase = expression.phrase.trim();
    if (!phrase) return;

    setPendingExpression({
      kind: "phrase",
      meaning: isReadableMeaning(expression.meaning)
        ? expression.meaning
        : defaultPhraseMeaning,
      phrase,
      sourceSentence: source || fallbackText,
    });
  }

  function openWord(word: string, fallbackText: string) {
    const phrase = normalizeClickableWord(word);
    if (!phrase) return;

    setPendingExpression({
      kind: "word",
      meaning: defaultWordMeaning,
      phrase,
      sourceSentence: source || fallbackText,
    });
  }

  function closeModal() {
    setPendingExpression(null);
    setIsSavingExpression(false);
  }

  function confirmSaveExpression() {
    if (!pendingExpression || isSavingExpression) return;

    setIsSavingExpression(true);
    const result = addVocabularyWord(
      pendingExpression.phrase,
      pendingExpression.sourceSentence
    );

    if (!result.ok) {
      if (pendingExpression.kind === "phrase") {
        updateVocabularyWord(pendingExpression.phrase, {
          meaning: pendingExpression.meaning,
          partOfSpeech: "phrase",
          example: pendingExpression.sourceSentence,
          sourceSentence: pendingExpression.sourceSentence,
        });
      }

      setPendingExpression({
        ...pendingExpression,
        statusMessage:
          result.reason === "DUPLICATE"
            ? "\u8fd9\u4e2a\u5185\u5bb9\u5df2\u7ecf\u5728\u8868\u8fbe\u5e93\u4e2d"
            : result.message,
      });
      setIsSavingExpression(false);
      return;
    }

    if (pendingExpression.kind === "phrase") {
      updateVocabularyWord(result.word.word, {
        meaning: pendingExpression.meaning,
        partOfSpeech: "phrase",
        example: pendingExpression.sourceSentence,
        sourceSentence: pendingExpression.sourceSentence,
      });
    } else {
      updateVocabularyWord(result.word.word, {
        partOfSpeech: "word",
        sourceSentence: pendingExpression.sourceSentence,
      });
    }

    closeModal();
  }

  return (
    <>
      <span className={getClassName(styles.text, className)}>
        {segments.map((segment, index) =>
          segment.type === "expression" ? (
            <button
              key={`${segment.value}-${index}`}
              type="button"
              className={getClassName(styles.highlight, highlightClassName)}
              onClick={(event) => {
                event.stopPropagation();
                openPhrase(segment.expression, text);
              }}
            >
              {segment.value}
            </button>
          ) : (
            <span key={`${segment.value}-${index}`}>
              {tokenizeEnglishSentence(segment.value).map((token, tokenIndex) =>
                token.type === "word" && token.normalized ? (
                  <button
                    key={`${token.value}-${tokenIndex}`}
                    type="button"
                    className={getClassName(styles.wordButton, wordClassName)}
                    onClick={(event) => {
                      event.stopPropagation();
                      openWord(token.value, text);
                    }}
                  >
                    {token.value}
                  </button>
                ) : (
                  <span key={`${token.value}-${tokenIndex}`}>{token.value}</span>
                )
              )}
            </span>
          )
        )}
      </span>

      {pendingExpression && typeof document !== "undefined"
        ? createPortal(
            <div className={styles.modalBackdrop} role="presentation">
              <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label={
                  pendingExpression.kind === "word"
                    ? "\u6536\u85cf\u5355\u8bcd"
                    : "\u6536\u85cf\u8868\u8fbe"
                }
              >
                <p className={styles.modalTitle}>{pendingExpression.meaning}</p>
                <p className={styles.phrase}>{pendingExpression.phrase}</p>
                {pendingExpression.statusMessage ? (
                  <p className={styles.message}>
                    {pendingExpression.statusMessage}
                  </p>
                ) : null}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.saveButton}
                    disabled={isSavingExpression}
                    onClick={confirmSaveExpression}
                  >
                    {pendingExpression.kind === "word"
                      ? "\u6536\u85cf\u5355\u8bcd"
                      : "\u6536\u85cf\u8868\u8fbe"}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={closeModal}
                  >
                    {pendingExpression.statusMessage
                      ? "\u77e5\u9053\u4e86"
                      : "\u53d6\u6d88"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
