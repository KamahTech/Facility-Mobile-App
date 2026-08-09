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
  rentals: {
    ios: "key.fill",
    android: "key",
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
  arrowRight: {
    ios: "arrow.right",
    android: "arrow_forward",
  },
  arrowLeft: {
    ios: "arrow.left",
    android: "arrow_back",
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
  calendar: {
    ios: "calendar",
    android: "calendar_today",
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
  password: {
    ios: "lock.fill",
    android: "lock",
  },
  phone: {
    ios: "phone.fill",
    android: "phone",
  },
  key: {
    ios: "key.fill",
    android: "key",
  },
  email: {
    ios: "envelope.fill",
    android: "mail",
  },
  search: {
    ios: "magnifyingglass",
    android: "search",
  },
  circle: {
    ios: "circle",
    android: "circle",
  },
  circleCheck: {
    ios: "checkmark.circle.fill",
    android: "check_circle",
  },
  inspection: {
    ios: "checkmark.shield.fill",
    android: "fact_check",
  },
  asset: {
    ios: "cube.box.fill",
    android: "inventory_2",
  },
  qrCode: {
    ios: "qrcode.viewfinder",
    android: "qr_code_scanner",
  },
  history: {
    ios: "clock.arrow.circlepath",
    android: "history",
  },
  document: {
    ios: "doc.text.fill",
    android: "description",
  },
  part: {
    ios: "wrench.adjustable.fill",
    android: "build",
  },
  fail: {
    ios: "xmark.circle.fill",
    android: "cancel",
  },
  warning: {
    ios: "exclamationmark.triangle.fill",
    android: "warning",
  },
  info: {
    ios: "info.circle.fill",
    android: "info",
  },
  notes: {
    ios: "note.text",
    android: "sticky_note_2",
  },
  flashOn: {
    ios: "bolt.fill",
    android: "flash_on",
  },
  flashOff: {
    ios: "bolt.slash.fill",
    android: "flash_off",
  },
  cameraFlip: {
    ios: "camera.rotate.fill",
    android: "flip_camera_ios",
  },
  wifiSlash: {
    ios: "wifi.slash",
    android: "wifi_off",
  },
  wifi: {
    ios: "wifi",
    android: "wifi",
  },
} as const;

export type AppIconName = keyof typeof appIcons;
