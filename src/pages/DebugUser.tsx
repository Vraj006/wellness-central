import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";

export default function DebugUser() {
  const { user, isLoading } = useAuth();
  const userData = useQuery(api.users.checkUser);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Debug Information</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Auth Hook Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify({ isLoading, user }, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Database User Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
