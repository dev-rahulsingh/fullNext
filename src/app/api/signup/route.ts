import { sendVerificationEmail } from "@/helper/sendVerificationMail";
import { connect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await connect();
  try {
    const { email, username, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is alreqdy taken",
        },
        { status: 4000 }
      );
    }
    const existingUserByemail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByemail) {
      if (existingUserByemail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 500 }
        );
      } else {
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserByemail.password = hasedPassword;
        existingUserByemail.verifyCode = verifyCode;
        existingUserByemail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByemail.save();
      }
    } else {
      const hasedPassword = await bcrypt.hash(password, 10);
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiry,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    //send Verification email
    const emailRespon = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailRespon.success) {
      return Response.json(
        {
          success: false,
          message: emailRespon.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered Successfully. Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("errror aaya signup me", error);
    Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
