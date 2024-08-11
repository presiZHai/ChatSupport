import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase"; // Adjust the import path according to your project structure

export default function ProtectedPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/sign-in"); // Redirect to sign-in page if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) return null; // Return null or a loading spinner during loading or redirect

  return <div>Protected Content</div>;
}