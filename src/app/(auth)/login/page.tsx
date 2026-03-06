import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";
import { EmailOtpForm } from "@/features/auth/components/EmailOtpForm";

const showOAuth = process.env.NEXT_PUBLIC_SHOW_OAUTH === "true";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="parchment-card w-full max-w-sm rounded-xl p-8">
        <div className="mb-6 text-center">
          <h1 className="rpg-heading text-3xl">⚔️ QuestLog Pro</h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Begin your adventure
          </p>
        </div>

        <div className="ornamental-divider mb-5" />

        <EmailOtpForm />

        {showOAuth && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted-text)]">or</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <SocialLoginButtons />
          </>
        )}
      </div>
    </div>
  );
}
