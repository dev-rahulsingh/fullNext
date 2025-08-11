"use client";

import UserModel, { Message } from "@/model/User";
import { AcceptMessageSchema } from "@/schemas/AcceptMessageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

function page() {
  const [messages, setMessage] = useState<Message[]>([]);
  const [loding, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleDeleteMessage = (messageID: string) => {
    setMessage(messages.filter((message) => message._id !== messageID));
  };

  // const { date: session } = useSession();
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessage");

  const fetchAcceptMessage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/accept-messages");
      setValue("acceptMessage", res.data.isAcceptingMessage);
    } catch (error) {
      console.error("Some Error founding in fetching the data", error);
    }
  }, [setValue]);
  return <div>Dashboard</div>;
}

export default page;
