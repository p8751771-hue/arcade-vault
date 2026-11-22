import { AuthForm } from "@/components/auth-form";

export default function AccessPage() {
  return (
    <main className="animate-fade-slide relative z-[1] flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
      <AuthForm />
    </main>
  );
}
