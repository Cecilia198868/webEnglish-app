"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createLoginUrl } from "@/lib/loginRedirect";
import styles from "./NotificationsPage.module.css";

type NotificationType =
  | "subscription"
  | "referral"
  | "learning"
  | "account"
  | "system";

type UserNotification = {
  createdAt: string;
  id: string;
  isRead: boolean;
  message: string;
  title: string;
  type: NotificationType;
  userEmail: string;
};

type FilterId = "all" | "unread" | NotificationType;
type PageStatus = "loading" | "ready" | "error" | "unauthorized";

const typeLabels: Record<NotificationType, string> = {
  account: "账号消息",
  learning: "学习提醒",
  referral: "邀请奖励",
  subscription: "订阅消息",
  system: "系统通知",
};

const filterTabs: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "全部消息" },
  { id: "unread", label: "未读消息" },
  { id: "subscription", label: "订阅消息" },
  { id: "referral", label: "邀请奖励" },
  { id: "learning", label: "学习提醒" },
  { id: "account", label: "账号消息" },
  { id: "system", label: "系统通知" },
];

function BellIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M9 23h14l-1.5-2.4V15a5.5 5.5 0 0 0-11 0v5.6L9 23Z" />
      <path d="M13.4 25a3 3 0 0 0 5.2 0" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 4.2 4.2L19 6.8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "时间未知";

  return date.toLocaleString("zh-CN", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function typeDescription(type: NotificationType) {
  if (type === "subscription") {
    return "会员开通、续订、取消和恢复购买等订阅状态变化都会显示在这里。";
  }

  if (type === "referral") {
    return "好友邀请、奖励到账和推荐活动相关消息会显示在这里。";
  }

  if (type === "learning") {
    return "学习提醒、课程进度和练习建议会显示在这里。";
  }

  if (type === "account") {
    return "登录、账号安全、资料同步和账号管理相关消息会显示在这里。";
  }

  return "SpeakFlow 的系统更新、客服回复和重要说明会显示在这里。";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [notice, setNotice] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications.filter((notification) => notification.type === activeFilter);
  }, [activeFilter, notifications]);

  const selectedNotification = filteredNotifications[0] || notifications[0] || null;
  const summaryStatusLabel =
    status === "ready"
      ? "已同步"
      : status === "loading"
        ? "读取中"
        : status === "unauthorized"
          ? "待登录"
          : "需重试";

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setStatus("loading");
      setNotice("");

      try {
        const response = await fetch(`/api/notifications?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as {
          notifications?: UserNotification[];
        };

        if (response.status === 401) {
          if (!cancelled) {
            setNotifications([]);
            setStatus("unauthorized");
          }
          return;
        }

        if (!response.ok || !Array.isArray(data.notifications)) {
          throw new Error("通知加载失败");
        }

        if (!cancelled) {
          setNotifications(data.notifications);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setNotice("通知加载失败，请稍后再试。");
          setStatus("error");
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  async function markAsRead(notificationId: string) {
    const current = notifications.find(
      (notification) => notification.id === notificationId
    );

    if (!current || current.isRead) return;

    setNotifications((items) =>
      items.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      )
    );

    try {
      const response = await fetch(
        `/api/notifications/${encodeURIComponent(notificationId)}`,
        {
          cache: "no-store",
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("通知状态更新失败");
      }
    } catch {
      setNotifications((items) =>
        items.map((item) =>
          item.id === notificationId ? { ...item, isRead: false } : item
        )
      );
      setNotice("通知状态更新失败，请稍后再试。");
      setStatus("error");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="返回 SpeakFlow 首页">
          <span className={styles.brandIcon}>
            <BellIcon />
          </span>
          <span>SpeakFlow 通知中心</span>
        </Link>
        <nav className={styles.topnav} aria-label="通知中心导航">
          <Link href="/">首页</Link>
          <Link href="/subscription">会员版</Link>
          <Link href="/contact">联系我们</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p>消息收件箱</p>
          <h1>查看 SpeakFlow 发给你的重要通知</h1>
          <span>
            订阅变化、邀请奖励、学习提醒、账号安全消息和客服回复都会集中显示在这里。
          </span>
        </div>
        <aside className={styles.summaryPanel} aria-label="通知概览">
          <div>
            <strong>{notifications.length}</strong>
            <span>全部消息</span>
          </div>
          <div>
            <strong>{unreadCount}</strong>
            <span>未读消息</span>
          </div>
          <div>
            <strong>{summaryStatusLabel}</strong>
            <span>当前状态</span>
          </div>
        </aside>
      </section>

      <section className={styles.workspace} aria-label="通知列表">
        <aside className={styles.sidebar}>
          <h2>消息分类</h2>
          <div className={styles.filterList}>
            {filterTabs.map((tab) => (
              <button
                aria-pressed={activeFilter === tab.id}
                data-active={activeFilter === tab.id}
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                type="button"
              >
                <span>{tab.label}</span>
                <small>
                  {tab.id === "all"
                    ? notifications.length
                    : tab.id === "unread"
                      ? unreadCount
                      : notifications.filter((item) => item.type === tab.id).length}
                </small>
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.inbox}>
          {status === "loading" ? (
            <div className={styles.stateCard}>
              <BellIcon />
              <h2>正在加载通知</h2>
              <p>请稍等，我们正在读取你的消息收件箱。</p>
            </div>
          ) : status === "unauthorized" ? (
            <div className={styles.stateCard}>
              <BellIcon />
              <h2>登录后查看通知</h2>
              <p>
                通知会绑定到你的 SpeakFlow 账号。登录后可以查看订阅、奖励、学习提醒和客服回复。
              </p>
              <Link href={createLoginUrl("/notifications")}>
                登录查看
                <ArrowIcon />
              </Link>
            </div>
          ) : notice ? (
            <div className={styles.stateCard} data-state="error">
              <BellIcon />
              <h2>{notice}</h2>
              <p>你可以刷新页面，或稍后重新打开通知中心。</p>
            </div>
          ) : filteredNotifications.length ? (
            <div className={styles.notificationList}>
              {filteredNotifications.map((notification) => (
                <button
                  className={styles.notificationCard}
                  data-read={notification.isRead}
                  data-type={notification.type}
                  key={notification.id}
                  onClick={() => void markAsRead(notification.id)}
                  type="button"
                >
                  <span className={styles.notificationIcon}>
                    {notification.isRead ? <CheckIcon /> : <BellIcon />}
                  </span>
                  <span className={styles.notificationCopy}>
                    <span className={styles.notificationMeta}>
                      <em>{typeLabels[notification.type]}</em>
                      <small>
                        {notification.isRead ? "已读" : "未读"} ·{" "}
                        {formatNotificationTime(notification.createdAt)}
                      </small>
                    </span>
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.stateCard}>
              <BellIcon />
              <h2>暂时没有通知</h2>
              <p>
                订阅更新、邀请奖励、学习提醒、账号安全和客服回复会出现在这里。
              </p>
            </div>
          )}
        </div>

        <aside className={styles.detailPanel} aria-label="消息说明">
          <h2>消息详情</h2>
          {selectedNotification ? (
            <>
              <span className={styles.detailType}>
                {typeLabels[selectedNotification.type]}
              </span>
              <h3>{selectedNotification.title}</h3>
              <p>{selectedNotification.message}</p>
              <small>{formatNotificationTime(selectedNotification.createdAt)}</small>
              <div className={styles.detailHint}>
                {typeDescription(selectedNotification.type)}
              </div>
            </>
          ) : (
            <>
              <span className={styles.detailType}>说明</span>
              <h3>这里会显示选中消息的内容</h3>
              <p>
                当你收到订阅、邀请、学习、账号或系统消息后，可以在这里快速查看详情。
              </p>
              <div className={styles.detailHint}>
                如果你需要人工帮助，可以从“联系我们”提交站内留言并留下邮箱。
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
