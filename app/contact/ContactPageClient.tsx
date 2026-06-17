"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import styles from "./ContactPage.module.css";

type ContactFormState = {
  contactEmail: string;
  issueType: string;
  message: string;
  name: string;
  page: string;
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const issueTypes = [
  { label: "学习功能问题", value: "practice_flow" },
  { label: "录音或麦克风", value: "voice" },
  { label: "账号与登录", value: "account_management" },
  { label: "会员或订阅", value: "payment" },
  { label: "课程创建", value: "course_creation" },
  { label: "产品建议", value: "suggestion" },
  { label: "其他问题", value: "other" },
] as const;

const initialForm: ContactFormState = {
  contactEmail: "",
  issueType: "practice_flow",
  message: "",
  name: "",
  page: "",
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className={styles.brandIcon} aria-hidden="true">
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M24 6c9.9 0 18 7 18 15.8 0 5.5-3.2 10.4-8.1 13.2l.8 6.2-6.5-3.2c-1.4.3-2.8.5-4.2.5-9.9 0-18-7-18-15.8S14.1 6 24 6Z" />
        <path d="M17 22v5M22 17v15M27 20v9M32 23v3" />
      </svg>
    </span>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 4.2 4.2L19 6.8" />
    </svg>
  );
}

export default function ContactPageClient() {
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [notice, setNotice] = useState("");
  const [feedbackId, setFeedbackId] = useState("");

  const selectedIssueLabel = useMemo(
    () => issueTypes.find((item) => item.value === form.issueType)?.label ?? "其他问题",
    [form.issueType]
  );

  async function submitContactMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") return;

    const email = form.contactEmail.trim();
    const message = form.message.trim();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setNotice("请留下可以回访的邮箱地址。");
      return;
    }

    if (message.length < 10) {
      setStatus("error");
      setNotice("请把问题或建议写得更具体一些，至少 10 个字。");
      return;
    }

    setStatus("submitting");
    setNotice("");
    setFeedbackId("");

    const composedMessage = [
      form.name.trim() ? `称呼：${form.name.trim()}` : "",
      `问题类型：${selectedIssueLabel}`,
      form.page.trim() ? `相关页面或功能：${form.page.trim()}` : "相关页面或功能：联系我们页",
      "站内留言：",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/support/feedback", {
        body: JSON.stringify({
          contactEmail: email,
          issueType: form.issueType,
          language: "zh-CN",
          message: composedMessage,
          page: form.page.trim() || "联系我们页",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "提交失败");
      }

      setStatus("success");
      setFeedbackId(result.id ?? "");
      setNotice("留言已发送。我们会通过你留下的邮箱跟进。");
      setForm((current) => ({ ...current, message: "", page: "" }));
    } catch {
      setStatus("error");
      setNotice("暂时无法发送留言，请稍后再试。");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="返回 SpeakFlow 首页">
          <BrandMark />
          <span>SpeakFlow</span>
        </Link>
        <nav className={styles.topnav} aria-label="联系页面导航">
          <Link href="/help">帮助中心</Link>
          <Link href="/about">关于我们</Link>
          <Link href="/privacy">隐私政策</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>联系 SpeakFlow</p>
          <h1>把问题留在这里，我们会认真处理</h1>
          <p>
            你可以通过站内留言告诉我们遇到的问题、想要的功能或课程建议。留下邮箱后，
            SpeakFlow 支持团队可以围绕你的留言继续回访。
          </p>
          <div className={styles.heroBadges} aria-label="联系渠道">
            <span>站内留言</span>
            <span>邮箱回访</span>
            <span>账号与订阅</span>
            <span>学习功能反馈</span>
          </div>
        </div>

        <aside className={styles.responsePanel} aria-label="处理流程">
          <h2>我们如何处理留言</h2>
          <ol>
            <li>
              <strong>收到站内留言</strong>
              <span>表单提交后会生成留言编号，内容会进入支持反馈记录。</span>
            </li>
            <li>
              <strong>定位具体问题</strong>
              <span>我们会根据页面、功能、账号状态和设备信息判断问题范围。</span>
            </li>
            <li>
              <strong>通过邮箱跟进</strong>
              <span>如果需要补充信息或回复处理结果，会通过你留下的邮箱联系。</span>
            </li>
          </ol>
        </aside>
      </section>

      <section className={styles.contactWorkspace} aria-label="联系我们表单">
        <form className={styles.form} onSubmit={submitContactMessage}>
          <div className={styles.formHeader}>
            <p>站内留言</p>
            <h2>告诉我们你遇到的问题</h2>
            <span>请尽量写清楚页面、操作步骤、设备和你希望我们如何回复。</span>
          </div>

          <div className={styles.fieldGrid}>
            <label>
              <span>你的称呼</span>
              <input
                autoComplete="name"
                maxLength={80}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="例如：王同学"
                value={form.name}
              />
            </label>

            <label>
              <span>回访邮箱</span>
              <input
                autoComplete="email"
                maxLength={160}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contactEmail: event.target.value,
                  }))
                }
                placeholder="you@example.com"
                required
                type="email"
                value={form.contactEmail}
              />
            </label>
          </div>

          <div className={styles.fieldGrid}>
            <label>
              <span>问题类型</span>
              <select
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    issueType: event.target.value,
                  }))
                }
                value={form.issueType}
              >
                {issueTypes.map((issue) => (
                  <option key={issue.value} value={issue.value}>
                    {issue.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>相关页面或功能</span>
              <input
                maxLength={160}
                onChange={(event) =>
                  setForm((current) => ({ ...current, page: event.target.value }))
                }
                placeholder="例如：AI 引导表达、创建课程、会员版"
                value={form.page}
              />
            </label>
          </div>

          <label className={styles.messageField}>
            <span>站内留言内容</span>
            <textarea
              maxLength={3000}
              minLength={10}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              placeholder="请描述你遇到的问题、发生在哪个页面、你做了什么操作、希望我们如何帮助你。"
              required
              rows={9}
              value={form.message}
            />
          </label>

          <div className={styles.formFooter}>
            <p>
              请不要提交密码、验证码、身份证件号码、完整银行卡号、医疗记录或其他敏感信息。
            </p>
            <button disabled={status === "submitting"} type="submit">
              <span>{status === "submitting" ? "正在发送..." : "发送留言"}</span>
              <ArrowIcon />
            </button>
          </div>

          {notice ? (
            <div className={styles.notice} data-status={status} role="status">
              <CheckIcon />
              <div>
                <strong>{notice}</strong>
                {feedbackId ? <span>留言编号：{feedbackId}</span> : null}
              </div>
            </div>
          ) : null}
        </form>

        <aside className={styles.sideColumn}>
          <section className={styles.infoPanel}>
            <h2>留言前可以准备这些信息</h2>
            <ul>
              <li>你正在使用的学习入口或页面名称。</li>
              <li>问题发生前后做过哪些操作。</li>
              <li>浏览器名称、设备系统和是否已登录账号。</li>
              <li>如果是页面显示问题，可以在留言中说明屏幕尺寸。</li>
            </ul>
          </section>

          <section className={styles.infoPanel}>
            <h2>适合通过这里联系的问题</h2>
            <div className={styles.topicList}>
              <span>录音权限</span>
              <span>AI 生成失败</span>
              <span>课程创建</span>
              <span>学习记录</span>
              <span>会员订阅</span>
              <span>产品建议</span>
            </div>
          </section>

          <section className={styles.infoPanel}>
            <h2>邮箱回访说明</h2>
            <p>
              留下邮箱是为了在需要补充信息、确认账号状态或回复处理结果时联系你。
              我们会围绕你的留言内容进行沟通，不会要求你提供密码或验证码。
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
