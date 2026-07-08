"use client";

import { useRouter } from "next/navigation";
import { Mail01, Mail04 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { cx } from "@/utils/cx";

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
    <ButtonUtility
      size="xs"
      color="tertiary"
      icon={isRead ? Mail04 : Mail01}
      tooltip={isRead ? "Mark as unread" : "Mark as read"}
      onClick={toggle}
      className={cx(!isRead && "text-fg-brand-primary hover:text-fg-brand-primary")}
    />
  );
}
