import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - ContractClauseAI",
  description: "Sign in or create an account to access ContractClauseAI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ContractClauseAI
          </h1>
          <p className="text-gray-600">AI-Powered Contract Analysis Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
