export const appIcons = {
  home: {
    ios: "house.fill",
    android: "home",
  },
  tickets: {
    ios: "clipboard.fill",
    android: "assignment",
  },
  profile: {
    ios: "person.fill",
    android: "person",
  },
  facility: {
    ios: "building.2.fill",
    android: "apartment",
  },
  resident: {
    ios: "person.crop.circle.fill",
    android: "person",
  },
  worker: {
    ios: "wrench.and.screwdriver.fill",
    android: "engineering",
  },
  check: {
    ios: "checkmark",
    android: "check",
  },
  themeSystem: {
    ios: "circle.lefthalf.filled",
    android: "contrast",
  },
  themeLight: {
    ios: "sun.max.fill",
    android: "light_mode",
  },
  themeDark: {
    ios: "moon.fill",
    android: "dark_mode",
  },
  notification: {
    ios: "bell.fill",
    android: "notifications",
  },
  arrowUpRight: {
    ios: "arrow.up.right",
    android: "arrow_outward",
  },
  arrowUpLeft: {
    ios: "arrow.up.left",
    android: "north_west",
  },
  linkUnit: {
    ios: "link",
    android: "link",
  },
  invoices: {
    ios: "doc.text.fill",
    android: "receipt_long",
  },
  requestService: {
    ios: "square.grid.2x2.fill",
    android: "apps",
  },
  inviteVisitor: {
    ios: "person.badge.plus.fill",
    android: "person_add",
  },
  feedback: {
    ios: "exclamationmark.bubble.fill",
    android: "feedback",
  },
  chevronRight: {
    ios: "chevron.right",
    android: "chevron_right",
  },
  chevronLeft: {
    ios: "chevron.left",
    android: "chevron_left",
  },
  chevronDown: {
    ios: "chevron.down",
    android: "keyboard_arrow_down",
  },
  camera: {
    ios: "camera.fill",
    android: "photo_camera",
  },
  gallery: {
    ios: "photo.on.rectangle.angled",
    android: "collections",
  },
  add: {
    ios: "plus",
    android: "add",
  },
  trash: {
    ios: "trash.fill",
    android: "delete",
  },
  close: {
    ios: "xmark",
    android: "close",
  },
  download: {
    ios: "square.and.arrow.down",
    android: "file_download",
  },
  send: {
    ios: "paperplane.fill",
    android: "send",
  },
  terms: {
    ios: "doc.text.fill",
    android: "description",
  },
  logout: {
    ios: "arrow.right.to.line",
    android: "logout",
  },
  plumbing: {
    ios: "drop.fill",
    android: "plumbing",
  },
  electrical: {
    ios: "bolt.fill",
    android: "bolt",
  },
  hvac: {
    ios: "wind",
    android: "ac_unit",
  },
  cleaning: {
    ios: "sparkles",
    android: "cleaning_services",
  },
  security: {
    ios: "shield.fill",
    android: "shield",
  },
  carpentry: {
    ios: "hammer.fill",
    android: "carpenter",
  },
  otherService: {
    ios: "ellipsis.circle.fill",
    android: "more_horiz",
  },
  language: {
    ios: "globe",
    android: "language",
  },
  english: {
    ios: "abc",
    android: "abc",
  },
  arabic: {
    ios: "translate",
    android: "translate",
  },
  retail: {
    ios: "cart.fill",
    android: "shopping_cart",
  },
} as const;

export type AppIconName = keyof typeof appIcons;
