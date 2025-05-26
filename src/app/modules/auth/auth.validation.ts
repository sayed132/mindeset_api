import z from "zod";


const loginUser = z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid login credentials, please try again.",
      }),
    password: z.string({
      required_error: "Password is required!",
    }),
    rememer:z.boolean().optional()
});

export const authValidation = { loginUser };
