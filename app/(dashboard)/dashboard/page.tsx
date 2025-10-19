import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getActiveSession, rotateUserSession } from "@/lib/auth/sessions";

export default async function DashboardPage() {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
  }

  try {
    await rotateUserSession(`${session.sessionId}.${session.refreshToken}`);
  } catch (error) {
    console.error("session rotation failed", error);
    redirect("/login?error=session-invalid");
  }

  const dbSession = await prisma.session.findUnique({
    where: { id: session.sessionId },
    include: { user: true }
  });

  if (!dbSession || !dbSession.user) {
    redirect("/login");
  }

  return (
    <main>
      <h1>Welcome back</h1>
      <p>You are signed in as {dbSession.user.email}.</p>
      <section className="alert">
        <h2>Security posture</h2>
        <ul>
          <li>Session rotation executed on page load.</li>
          <li>Audit trail captured for magic link sign-in.</li>
          <li>All sensitive actions require server actions with CSRF-free semantics.</li>
        </ul>
      </section>
    </main>
  );
}
