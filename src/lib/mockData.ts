export const initialLoginPageContent = {
  logoText: "ЖУРБА MUSIC",
  welcomeTitle: "Ласкаво просимо",
  welcomeSubtitle: "Увійдіть, щоб продовжити",
  leftTitle: "Твоя музика.",
  leftText1: "Скрізь.",
  leftText2: "Дистрибуція на 150+ стрімінгових платформ. Залишай собі 100% роялті. Відстежуй успіх у реальному часі.",
  warningText: "Email не підтверджено",
  feature1: "150+ Платформ",
  feature2: "100% Роялті",
  feature3: "24/7 Підтримка",
  buttonText: "Увійти",
  signupLink: "Немає акаунту? Зареєструватися",
  demoText: "Демо: admin / admin2",
  socialIcons: ["Spotify", "Apple Music", "YouTube", "Amazon", "Tidal", "Deezer"],
  primaryColor: "#8b5cf6",
  secondaryColor: "#1e1e2f",
};

export const initialStatuses = [
  { id: 1, name: "На модерації", color: "yellow", order: 1, isDefault: true },
  { id: 2, name: "Опубліковано", color: "green", order: 2, isDefault: false },
  { id: 3, name: "Відхилено", color: "red", order: 3, isDefault: false },
];

export const initialFields = [
  { id: 1, name: "title", label: "Назва релізу", type: "text", required: true, order: 1, visible: true, forRole: "artist", section: "release" },
  { id: 2, name: "artist", label: "Основний артист", type: "text", required: true, order: 2, visible: true, forRole: "artist", section: "release" },
  { id: 3, name: "genre", label: "Жанр", type: "select", options: JSON.stringify(["Hip-Hop", "Pop", "Electronic", "Rock", "Sad Rap"]), required: true, order: 3, visible: true, forRole: "artist", section: "release" },
  { id: 4, name: "releaseDate", label: "Дата релізу", type: "date", required: true, order: 4, visible: true, forRole: "artist", section: "release" },
  { id: 5, name: "coverUrl", label: "Обкладинка (URL)", type: "url", required: true, order: 5, visible: true, forRole: "artist", section: "release" },
  { id: 6, name: "audioUrl", label: "Аудіофайл (URL)", type: "url", required: true, order: 6, visible: true, forRole: "artist", section: "release" },
  { id: 7, name: "bio", label: "Біографія", type: "textarea", required: false, order: 1, visible: true, forRole: "artist", section: "profile" },
];