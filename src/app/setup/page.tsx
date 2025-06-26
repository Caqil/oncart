import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SetupWizard } from "@/components/setup/setup-wizard";

export default async function SetupPage() {
  // Check if setup is already completed
  const adminExists = await db.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  const setupCompleted = await db.setting.findUnique({
    where: { key: "setup_completed" },
  });

  if (adminExists && setupCompleted?.value === "true") {
    redirect("/admin");
  }

  return (
    <div>
      <SetupWizard />
    </div>
  );
}
