export const PUBLIC_NAV_LINKS = [
  { name: "Feeding Updates", path: "/impact", primary: false },
  { name: "Our Story", path: "/mission", primary: false },
  { name: "Transparency", path: "/impact#transparency", primary: false },
  { name: "Donate", path: "/support", primary: true },
] as const;

export const PUBLIC_HOME_ACTIONS = [
  { name: "See Our Impact", path: "/impact", primary: true },
  { name: "Support Feeding", path: "/support", primary: false },
] as const;

export const PUBLIC_PUBLISHING_REDIRECT_PATH = "/";
