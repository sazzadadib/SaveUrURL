// src/app/signup/page.tsx
'use client';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, User, UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const router = useRouter();
  const { status } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // Check password strength
    const errors: string[] = [];
    const pwd = formData.password;
    
    if (pwd.length > 0) {
      if (pwd.length < 8) errors.push("At least 8 characters");
      if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
      if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
      if (!/[0-9]/.test(pwd)) errors.push("One number");
      
      setPasswordStrength(errors);
    } else {
      setPasswordStrength([]);
    }
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
      } else {
        // Redirect to verification page with email
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 relative z-10 animate-fadeIn">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-3 sm:mb-4 shadow-lg shadow-purple-500/50">
            <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-300 text-sm sm:text-base flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Join us and start organizing your links
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 animate-shake text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
              <User className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all text-sm sm:text-base"
              placeholder="John Doe"
            />
          </div>

          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all text-sm sm:text-base"
              placeholder="you@example.com"
            />
          </div>

          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all pr-12 text-sm sm:text-base"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {formData.password && passwordStrength.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400">Password must contain:</p>
                {passwordStrength.map((req, index) => (
                  <p key={index} className="text-xs text-red-300 flex items-center gap-1">
                    <span>•</span> {req}
                  </p>
                ))}
              </div>
            )}
            
            {formData.password && passwordStrength.length === 0 && (
              <p className="text-xs text-green-300 mt-2 flex items-center gap-1">
                ✓ Strong password
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordStrength.length > 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-300 text-sm sm:text-base">
          Already have an account?{" "}
          <Link href="/signin" className="text-purple-300 hover:text-purple-200 font-semibold hover:underline transition-colors">
            Sign In
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}