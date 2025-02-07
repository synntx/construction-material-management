"use client";

import { LoginForm } from "@/components/loginForm";
import api from "@/lib/apiClient";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignIn = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await api.post("/api/v1/signin", values);
      toast.success("Signin successful");
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data.statusCode == 401) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Error during signin");
          console.error(
            "Error during signin",
            error.response?.data || error.message
          );
        }
      } else {
        toast.error("Error during signin");
        console.error("Error during signin: ", error);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <LoginForm onSubmit={handleSignIn} loading={loading} />
      </div>
    </div>
  );
}
