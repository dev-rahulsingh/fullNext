import { connect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
// import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "Credentials",
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await connect();
        try {
          const user = await UserModel.findOne({
            // $or: [
            //   { email: credentials.identifier },
            //   { username: credentials.identifier },
            // ],
            $or: [
              { email: credentials.username },
              { username: credentials.username },
            ],
          });
          if (!user) {
            throw new Error("No user found with this Email");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("password is incorrect");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user._id = token._id;
        session.user._isVerified = token.isVerified;
        session.user._isAcceptingMessages = token.isAcceptingMessages;
        session.user._token = token.username;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
