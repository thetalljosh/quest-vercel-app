import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";
import { EmailOtpForm } from "@/features/auth/components/EmailOtpForm";

const showOAuth = process.env.NEXT_PUBLIC_SHOW_OAUTH === "true";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-gray-200
                      bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">⚔️ QuestLog Pro</h1>
          <p className="mt-1 text-sm text-gray-500">
            Begin your adventure
          </p>
        </div>

        <EmailOtpForm />

        {showOAuth && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <SocialLoginButtons />
          </>
        )}
      </div>
    </div>
  );
}
