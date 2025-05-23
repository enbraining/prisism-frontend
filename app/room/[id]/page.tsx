"use client";

import { AxiosInstance } from "@/app/util/axios";
import { redirect, useParams } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

export interface MessageRequest {
  id: number;
  message: string;
  client: string;
}

export interface HistoryResponse {
  id: string;
  content: string;
  clientId: string;
}

export default function Page() {
  const params = useParams();
  const messageRef = useRef<HTMLDivElement>();
  const socketRef = useRef<Socket | null>(null);

  const [chats, setChats] = useState<MessageRequest[]>([]);
  const [message, setMessage] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = useCallback((e: ChangeEvent | any) => {
    e.preventDefault();
    setMessage(e.target.value);
  }, []);

  const onQuit = useCallback(() => {
    socketRef.current?.disconnect();
    redirect("/");
  }, [socketRef]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
        if (!message.trim() || !socketRef.current) return;

        if (message.length > 80) {
          toast.warning("80자를 초과해서 전송할 수 없습니다.");
          setMessage("");
          return;
        }

        socketRef.current.emit("pub-message", {
          message: message.trim(),
        });

        setChats((prev) => [
          ...prev,
          {
            id: 1,
            message: message.trim(),
            client: socketRef.current?.id ?? "",
          },
        ]);

        setMessage("");
        e.preventDefault();

        messageRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [message, socketRef]
  );

  const loadHistory = useCallback((roomId: string) => {
    const fetchHistory = async () => {
      const response = await AxiosInstance.get(`/room/${roomId}/history`);
      setChats(
        response.data.map((history: HistoryResponse) => ({
          id: 1,
          message: history.content,
          client: history.clientId,
        }))
      );
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    const roomId = params.id;

    loadHistory(roomId as string);

    const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/chat`, {
      transports: ["websocket"],
      path: "/socket.io/",
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      if (roomId) {
        newSocket.emit("join", { roomId });
      }
    });

    newSocket.on("error", (error) => {
      alert(error.message);
      redirect("/");
    });

    newSocket.on(`sub-message-${roomId}`, (data: MessageRequest) => {
      if (data.client != newSocket.id) setChats((prev) => [...prev, data]);
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("error");
        newSocket.off(`sub-message-${roomId}`);
        newSocket.disconnect();
      }
    };
  }, [params.id]);

  return (
    <main>
      <div className="bg-base-200 mx-auto sm:w-1/2 w-full overflow-y-auto p-5 pt-32 h-[100vh]">
        {chats.map((chat, index) =>
          chat.client == "JOIN" || chat.client == "END" ? (
            <div className="w-full flex my-3 text-neutral-500" key={index}>
              <p className="mx-auto">{chat.message}</p>
            </div>
          ) : (
            <div
              key={index}
              className={`chat ${
                chat.client == socketRef.current?.id
                  ? "chat-sender ml-auto"
                  : "chat-receiver mr-auto"
              }`}
            >
              <div className="chat-header text-base-content/90">
                {chat.client}
              </div>
              <div className="chat-bubble">{chat.message}</div>
            </div>
          )
        )}
        <div
          className="h-15"
          ref={messageRef as React.RefObject<HTMLDivElement>}
        />
      </div>

      <div className="fixed w-full bottom-0">
        <div className="mx-auto flex gap-x-2 sm:w-1/2 p-2">
          <input
            value={message}
            onKeyDown={handleKeyPress}
            onChange={handleChange}
            type="text"
            placeholder="채팅을 입력해주세요."
            className="input"
          />
          <button className="btn btn-primary" onClick={onQuit}>
            나가기
          </button>
        </div>
      </div>
    </main>
  );
}
