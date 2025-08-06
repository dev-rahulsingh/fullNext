import { connect } from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req: Request) {
  await connect();
  try {
    const { username, code } = await req.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not found ",
        },
        {
          status: 500,
        }
      );
    }

    const iscodeValid = user.verifyCode === code;
    const iscodeExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (iscodeValid && iscodeExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account Verify successfully ",
        },
        {
          status: 200,
        }
      );
    } else if (iscodeExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired please signup agin to get a new code ",
        },
        {
          status: 500,
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect Verification code ",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error Verifying user", error);
    return Response.json(
      {
        success: false,
        message: "Error Verifying user ",
      },
      {
        status: 500,
      }
    );
  }
}
