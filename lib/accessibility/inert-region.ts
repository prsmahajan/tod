"use client";

import { useCallback } from "react";

type InertElement = Pick<HTMLElement, "removeAttribute" | "setAttribute">;

export function setInertState(element: InertElement, inactive: boolean) {
  if (inactive) {
    element.setAttribute("inert", "");
    return;
  }

  element.removeAttribute("inert");
}

export function useInertRegion<ElementType extends HTMLElement>(inactive: boolean) {
  return useCallback((element: ElementType | null) => {
    if (element) setInertState(element, inactive);
  }, [inactive]);
}
