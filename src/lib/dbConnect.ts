import mongoose from "mongoose";

type ConnectionObject = {
  isConnected: number;
};
const connection: ConnectionObject = {
  isConnected: 0,
};

export const connect = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("already connect to database");
    return;
  }
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL environment variable is not defined.");
  }
  try {
    const dbConnect = await mongoose.connect(process.env.MONGO_URL || "", {});

    connection.isConnected = dbConnect.connections[0].readyState;

    console.log("Database Connected Successfully");
  } catch (error: any) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
};
