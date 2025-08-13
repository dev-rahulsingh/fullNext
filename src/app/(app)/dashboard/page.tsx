"use client";

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message, User } from "@/model/User";
import { AcceptMessageSchema } from "@/schemas/AcceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponce";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
// import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function page() {
  const [messages, setMessage] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
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

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setLoading(true);
      setSwitching(false);
      try {
        const res = await axios.get<ApiResponse>("/api/get-messages");
        setMessage(res.data.messages || []);
        if (refresh) {
          toast.info("Refresh Messsages", {
            description: "Showing latest messages",
          });
        }
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
    },
    [setLoading, setMessage]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchAcceptMessage();
    fetchMessages();
  }, [setValue, session, fetchAcceptMessage, fetchMessages]);

  //handle switch chnages
  const handleSwitchChange = async () => {
    try {
      const res = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessage", !acceptMessages);
      toast(res.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Error", {
        description:
          axiosError.response?.data.message ||
          "failed to fetch message setting",
      });
    }
  };

  // copy to  clipboard

  const { username } = session?.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("URL Copied!", {
      description: "Profile URL has been copied to clipboard.",
    });
  };

  if (!session || !session.user) {
    return <div>Please Login</div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessage")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={switching}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id || index}
              // key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default page;
