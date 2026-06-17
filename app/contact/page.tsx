import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "联系我们 | SpeakFlow",
  description: "通过站内留言和邮箱回访联系 SpeakFlow 支持团队。",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
