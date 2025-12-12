"use client";

import type { MouseEvent, ReactElement } from "react";
import { Suspense, cloneElement, isValidElement } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface LoginModalProps {
  children: ReactElement;
}

function LoginModalContent({ children }: LoginModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const callbackUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (children.props.onClick) {
      children.props.onClick(event);
      if (event.defaultPrevented) return;
    }

    const loginUrl = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";

    router.push(loginUrl);
  };

  if (!isValidElement(children)) {
    return null;
  }

  return cloneElement(children, {
    onClick: handleClick,
  });
}

export function LoginModal({ children }: LoginModalProps) {
  return (
    <Suspense fallback={children}>
      <LoginModalContent>{children}</LoginModalContent>
    </Suspense>
  );
}

export default LoginModal;
