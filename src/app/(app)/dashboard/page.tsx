"use client";

import { Message } from "@/model/User";
import { AcceptMessageSchema } from "@/schemas/AcceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponce";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
// import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function page() {
  const [messages, setMessage] = useState<Message[]>([]);
  const [loding, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleDeleteMessage = (messageID: string) => {
    setMessage(messages.filter((message) => message._id !== messageID));
  };

  const { data: session } = useSession();
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
      const axiosError = error as AxiosError<ApiResponse>;
      // console.error("Some Error founding in fetching the data", error);
      toast.error("Error", {
        description:
          axiosError.response?.data.message ||
          "failed to fetch message setting",
      });
    } finally {
      setSwitching(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setLoading(true);
    setSwitching(false);
    try {
      const res = await axios.get<ApiResponse>("/api/get-messages");
      setMessage(res.data.messages || []);
      toast.info("Refresh Messsages", {
        description: "Showing latest messages",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      // console.error("Some Error founding in fetching the data", error);
      toast.error("Error", {
        description:
          axiosError.response?.data.message ||
          "failed to fetch message setting",
      });
    } finally {
      setSwitching(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || !session.user) return fetchAcceptMessage();
    fetchMessages();
  }, [setValue, session, fetchAcceptMessage, fetchMessages]);

  //handle switch chnages
  const handleSwitchChange = async () => {
    try {
      axios.post("/api/accept-messages", { acceptMessages: !acceptMessages });
    } catch (error) {}
  };

  return <div>Dashboard</div>;
}

export default page;
