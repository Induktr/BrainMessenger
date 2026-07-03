import z from "zod";

const sizeSchema = z.enum(["sm", "md",  "lg", "xl"]);

export type AvatarSize = z.infer<typeof sizeSchema>;