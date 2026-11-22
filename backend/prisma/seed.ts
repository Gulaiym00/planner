import { prisma } from "../src/db/prisma.js";

const DEFAULT_SPHERES = [
  { name: "Учёба", icon: "📚", color: "#7c5cff" },
  { name: "Курсы", icon: "🎓", color: "#22c7b8" },
  { name: "Спорт", icon: "💪", color: "#ff8a3d" },
  { name: "Дом", icon: "🏠", color: "#e0a800" },
  { name: "Друзья", icon: "🎉", color: "#ff5fa2" },
];

// Создаём сферы по умолчанию только в пустой базе, чтобы не трогать то, что пользователь уже настроил
const count = await prisma.sphere.count();
if (count === 0) {
  await prisma.sphere.createMany({ data: DEFAULT_SPHERES.map((s, sortOrder) => ({ ...s, sortOrder })) });
  console.log(`Created ${DEFAULT_SPHERES.length} default spheres`);
} else {
  console.log(`Spheres already exist (${count}), skipping`);
}

await prisma.$disconnect();
