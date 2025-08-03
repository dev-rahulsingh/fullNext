import { connect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signupSchema";
import z from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  //use this for all the routes

  //   if (req.method !== "GET") {
  //     return Response.json(
  //       {
  //         success: false,
  //         message: "Method not allowed",
  //       },
  //       {
  //         status: 405,
  //       }
  //     );
  //   }
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    //Validation with Zod
    const result = UsernameQuerySchema.safeParse(queryParams);

    console.log(result); // ToDo remove

    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameError?.length > 0
              ? usernameError.join(",")
              : "Invalid query partametr",
        },
        {
          status: 400,
        }
      );
    }

    const { username } = result.data;

    const existedUser = await UserModel.findOne({ username, isVerified: true });
    if (existedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username is Unique",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error check username", error);
    return Response.json(
      {
        success: false,
        message: "Username Already exist ",
      },
      {
        status: 500,
      }
    );
  }
}
