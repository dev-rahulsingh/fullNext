import z from "zod";

export const usernameValidation = z
  .string()
  .min(4, "Username will be atleast 4 Characters")
  .max(20, "Username must be no more than 20 Characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Usename must not contain special character");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "password must be at least 6 characters" }),
});
