"use client";
import React, { useEffect, useState } from "react";
import { useLogin } from "./useLogin";

const greetings = [
  "Salam",
  "Hello",
  "Bonjour",
  "Hola",
  "Ciao",
  "Hallo",
  "Namaste",
  "Olá",
];

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Default credentials for dev mode
  const isDev = process.env.NODE_ENV === "development";
  const defaultEmail = isDev ? "admin@admin.com" : "";
  const defaultPassword = isDev ? "Admin@123" : "";
  const [showBackdrop, setShowBackdrop] = useState(open);
  const { login, loading, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (open) {
      setShowBackdrop(true);
    } else {
      const backdropTimer = setTimeout(() => setShowBackdrop(false), 600);
      return () => {
        clearTimeout(backdropTimer);
      };
    }
  }, [open]);
  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      document.cookie.includes("your_auth_cookie_name")
    ) {
      window.location.href = "/dashboard";
    }
  }, []);
  if (!showBackdrop) return null;
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      ?.value;
    const success = await login(email, password);
    if (success) {
      window.location.href = "/dashboard";
    }
  }
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
        open ? "animate-backdrop-in" : "animate-backdrop-out"
      }`}
      onClick={handleBackdropClick}
    >
      <div className='relative w-full max-w-md'>
        <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-60 blur-lg'></div>
        <div
          className={`relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-10 flex flex-col items-center ${
            open ? "animate-modal-in-up" : "animate-modal-out-up"
          }`}
        >
          <svg
            width='48'
            height='48'
            viewBox='0 0 24 24'
            fill='none'
            className='mb-4'
          >
            <circle cx='12' cy='12' r='10' fill='#6366F1' />
            <path
              d='M8 12l2 2 4-4'
              stroke='#fff'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <h2 className='text-3xl font-extrabold mb-2 text-center text-blue-700 dark:text-white drop-shadow-lg'>
            Admin Login
          </h2>
          <p className='text-center text-zinc-500 dark:text-zinc-300 mb-6'>
            Sign in to manage your events
          </p>
          <form className='space-y-6 w-full' onSubmit={handleLogin}>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'
              >
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                placeholder='admin@example.com'
                required
                defaultValue={defaultEmail}
                className='mt-2 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={loading}
              />
            </div>
            <div className='relative'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'
              >
                Password
              </label>
              <input
                id='password'
                name='password'
                type={showPassword ? "text" : "password"}
                placeholder='••••••••'
                required
                defaultValue={defaultPassword}
                className='mt-2 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10'
                disabled={loading}
              />
              <button
                type='button'
                tabIndex={-1}
                className='absolute right-3 top-9 text-zinc-500 dark:text-zinc-300 hover:text-blue-500'
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='22'
                    height='22'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-10.44-7.44a2.99 2.99 0 0 1 0-1.12A10.06 10.06 0 0 1 6.06 6.06m3.53-1.6A9.98 9.98 0 0 1 12 4c5 0 9.27 3.11 10.44 7.44a2.99 2.99 0 0 1 0 1.12c-.36 1.36-1.08 2.62-2.06 3.68M9.53 4.46l9.01 9.01M4.46 4.46l15.08 15.08'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='22'
                    height='22'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M1.56 12.56A10.06 10.06 0 0 1 6.06 6.06 9.98 9.98 0 0 1 12 4c5 0 9.27 3.11 10.44 7.44a2.99 2.99 0 0 1 0 1.12A10.06 10.06 0 0 1 17.94 17.94 9.98 9.98 0 0 1 12 20c-5 0-9.27-3.11-10.44-7.44a2.99 2.99 0 0 1 0-1.12z'
                    />
                    <circle
                      cx='12'
                      cy='12'
                      r='3'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <div className='text-red-500 text-sm text-center'>{error}</div>
            )}
            <button
              type='submit'
              className='w-full px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform'
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

type GreetingSplashProps = {
  showLoginOnly?: boolean;
};

export default function GreetingSplash({
  showLoginOnly = false,
}: GreetingSplashProps) {
  const [step, setStep] = useState(0);
  const [showSplash, setShowSplash] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (showLoginOnly) {
      setShowSplash(true);
      setShowLogin(true);
      return;
    }
    if (step < greetings.length) {
      const timer = setTimeout(() => setStep(step + 1), 180);
      return () => clearTimeout(timer);
    } else {
      const fadeTimer = setTimeout(() => setShowSplash(true), 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [step, showLoginOnly]);

  return (
    <>
      {showLoginOnly ? (
        <LoginModal open={true} onClose={() => {}} />
      ) : !showSplash ? (
        <span
          key={step}
          className='text-5xl font-extrabold text-white animate-fade-in-out'
          style={{ transition: "opacity 0.5s" }}
        >
          {greetings[step]}
        </span>
      ) : (
        <div className='fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-zinc-900 dark:via-indigo-900 dark:to-blue-900 animate-fade-in-full'>
          <svg
            width='96'
            height='96'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='mb-8 drop-shadow-xl'
          >
            <circle cx='12' cy='12' r='10' fill='#6366F1' />
            <path
              d='M8 12l2 2 4-4'
              stroke='#fff'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <h1 className='text-5xl font-extrabold text-center text-white mb-6 drop-shadow-2xl animate-fade-in-up'>
            Welcome to Event Planner Dashboard
          </h1>
          <p className='text-2xl text-center text-white/80 mb-8 animate-fade-in-up'>
            Your all-in-one platform to manage, discover, and celebrate amazing
            events.
          </p>
          <span
            className='inline-block px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xl font-semibold shadow-lg animate-bounce cursor-pointer animate-fade-in-up'
            onClick={() => setShowLogin(true)}
          >
            Let’s Get Started!
          </span>
          <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
        </div>
      )}
      <style jsx global>{`
        @keyframes backdrop-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes backdrop-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .animate-backdrop-in {
          animation: backdrop-in 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-backdrop-out {
          animation: backdrop-out 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-in-out {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 0.5s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-out-down {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(60px);
          }
        }
        .animate-fade-out-down {
          animation: fade-out-down 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-in-full {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-full {
          animation: fade-in-full 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes modal-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
        }
        .modal-in {
          animation: modal-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-out {
          animation: modal-out 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes modal-in-up {
          from {
            opacity: 0;
            transform: translateY(160px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-modal-in-up {
          animation: modal-in-up 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes modal-out-up {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-160px);
          }
        }
        .animate-modal-out-up {
          animation: modal-out-up 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-in-up-slow {
          from {
            opacity: 0;
            transform: translateY(160px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up-slow {
          animation: fade-in-up-slow 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-out-down-slow {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(160px);
          }
        }
        .animate-fade-out-down-slow {
          animation: fade-out-down-slow 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}
