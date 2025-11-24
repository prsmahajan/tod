"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LoginModalProps {
  children: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    setOpen(false);
    router.push("/login");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to The Open Draft</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Join our community to access premium content and help feed stray animals across India.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              ✨ Access premium tech articles
            </p>
            <p className="text-sm text-gray-600">
              🐾 Feed stray animals with your subscription
            </p>
            <p className="text-sm text-gray-600">
              💝 Join a community making real impact
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg hover:opacity-80 transition-opacity font-medium"
          >
            Continue to Login
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
