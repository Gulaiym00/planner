import { z } from "zod";

export const idSchema = z.uuid("Некорректный идентификатор");

export const nameSchema = (max = 80) =>
  z
    .string({ error: "Введите название" })
    .trim()
    .min(1, "Введите название")
    .max(max, `Название не длиннее ${max} символов`);

/** Необязательный текст: пустая строка превращается в null */
export const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, `Не длиннее ${max} символов`)
    .transform((v) => v || null)
    .nullable()
    .optional();

export const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Цвет должен быть в формате #rrggbb");

export const dateOnlySchema = z.iso.date("Дата должна быть в формате ГГГГ-ММ-ДД");

export const dateTimeSchema = z.iso.datetime({ offset: true, error: "Некорректные дата и время" });

export const booleanQuery = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => v === "true");

export const moveToQuery = z.object({ moveTo: idSchema.optional() });
