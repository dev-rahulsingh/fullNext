import { connect } from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await connect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  //in this we are taking out user from session which we ahve stored in session at nextauth options

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  const userID = user._id;
  const { acceptMessage } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userID,
      {
        isAcceptingMessage: acceptMessage,
      },
      { new: true }
    );
    return Response.json(
      {
        success: true,
        message: "Message accepatnce status updated successully",
        updatedUser,
      },
      { status: 401 }
    );
  } catch (error) {
    console.log("Failed to updated user status to accept message");

    return Response.json(
      {
        success: false,
        message: "Failed to updated user status to accept message",
      },
      { status: 401 }
    );
  }
}

export async function GET(request: Request) {
  await connect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  //in this we are taking out user from session which we ahve stored in session at nextauth options

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  const userID = user._id;

  try {
    const foundUser = await UserModel.findById(userID);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to updated user status to accept message");

    return Response.json(
      {
        success: false,
        message: "Error is getting message acceptance status",
      },
      { status: 500 }
    );
  }
}
