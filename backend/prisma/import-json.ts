/**
 * Переносит задачи из старого data/tasks.json в PostgreSQL.
 * Повторный запуск безопасен: задачи с тем же id не дублируются. Сам JSON-файл не меняется.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/db/prisma.js";

interface LegacyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

const file = path.resolve(process.argv[2] ?? "data/tasks.json");
const tasks = JSON.parse(await readFile(file, "utf-8")) as LegacyTask[];

let imported = 0;
for (const task of tasks) {
  const exists = await prisma.task.findUnique({ where: { id: task.id }, select: { id: true } });
  if (exists) continue;
  await prisma.task.create({
    data: {
      id: task.id,
      title: task.title,
      description: task.description || null,
      completed: task.completed,
      // Когда именно задача была выполнена, старый формат не хранил — ставим дату создания
      completedAt: task.completed ? new Date(task.createdAt) : null,
      createdAt: new Date(task.createdAt),
    },
  });
  imported++;
}

console.log(`Imported ${imported} of ${tasks.length} tasks from ${file}`);
await prisma.$disconnect();
