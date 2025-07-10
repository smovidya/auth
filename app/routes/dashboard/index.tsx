import type { Route } from "./+types/index";

export default function DeveloperIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Developer Portal</h1>
      <p className="text-lg mb-2">Welcome to the developer portal!</p>
      <p className="text-gray-600">Here you can manage your OAuth2 applications and settings.</p>
    </div>
  );
}