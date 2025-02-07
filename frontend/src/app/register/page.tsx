"use client";

import { RegisterForm } from "@/components/registerForm";
import api from "@/lib/apiClient";
import axios from "axios";
import { toast } from "sonner";

export default function RegisterPage() {
  const handleSignup = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post("/api/v1/signup", values);
      console.log("Signup Successful:", response.data);
      toast.success("Signup Successful");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during signup:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error during signup: ", error);
      }
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
        <RegisterForm onSubmit={handleSignup} />
      </div>
    </div>
  );
}
