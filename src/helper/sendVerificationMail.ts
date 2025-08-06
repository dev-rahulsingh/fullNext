import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationtemplate";
import { ApiResponse } from "@/types/ApiResponce";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystry Message | Verification mail",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: "Verification email sedn successfully" };
  } catch (emailError) {
    console.error("Error sending Verification email", emailError);
    return { success: false, message: "Failed to send verification mail" };
  }
}
