import z from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Content must be atleast of 10 character" })
    .max(300, { message: "content must not more than 300 characters" }),
});
