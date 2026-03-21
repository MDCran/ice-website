"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MailOpen, Mail } from "lucide-react";

export default function ContactReadToggle({
  id,
  isRead,
}: {
  id: string;
  isRead: boolean;
}) {
  const router = useRouter();

  const toggle = async () => {
    const supabase = createClient();
    await supabase
      .from("contacts")
      .update({ is_read: !isRead })
      .eq("id", id);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
        isRead
          ? "text-slate-500 hover:text-sky-400 hover:bg-sky-500/10"
          : "text-sky-400 hover:text-slate-400 hover:bg-white/10"
      }`}
      title={isRead ? "Mark as unread" : "Mark as read"}
    >
      {isRead ? <MailOpen size={15} /> : <Mail size={15} />}
    </button>
  );
}
