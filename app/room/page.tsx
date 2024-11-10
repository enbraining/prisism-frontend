"use client";

import { redirect, useSearchParams } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export interface MessageRequest {
  id: number;
  message: string;
  client: string;
}

export default function Page() {
  const searchParams = useSearchParams();
  const messageRef = useRef<HTMLDivElement>();

  const [connected, setConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [socket, setSocket] = useState<any>(null);
  const [chats, setChats] = useState<MessageRequest[]>([]);
  const [message, setMessage] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = useCallback((e: ChangeEvent | any) => {
    e.preventDefault();
    setMessage(e.target.value);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
        if (!message.trim() || !socket) return;

        socket.emit("pub-message", {
          message: message.trim(),
        });
        setChats([
          ...chats,
          {
            id: 1,
            message: message.trim(),
            client: socket.id,
          },
        ]);
        setMessage("");
        e.preventDefault();

        messageRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [chats, message, socket]
  );

  useEffect(() => {
    const roomId = searchParams.get("id");
    const newSocket = io("http://localhost:3030/chat", {
      transports: ["websocket"],
      path: "/socket.io/",
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("connected", newSocket.id);
      setConnected(true);

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
  }, [searchParams]);

  // 연결 상태 디버깅을 위한 로그
  useEffect(() => {
    console.log("Connection status:", connected);
  }, [connected]);

  return (
    <main className="grid">
      <input
        value={message}
        onKeyDown={handleKeyPress}
        onChange={handleChange}
        type="text"
        placeholder="Type here"
        className="z-10 input max-w-sm fixed bottom-[2rem] left-1/2 -translate-x-1/2"
      />
      <div className="sm:mx-auto w-full md:w-1/2 sm:px-16 min-h-screen border-x">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat ${
              chat.client == socket.id
                ? "chat-sender ml-auto"
                : "chat-receiver mr-auto"
            }`}
          >
            <div className="chat-header text-base-content/90">
              {chat.client}
              <time className="text-base-content/50">12:46</time>
            </div>
            <div className="chat-bubble border">{chat.message}</div>
          </div>
        ))}
        <div
          className="mt-24"
          ref={messageRef as React.RefObject<HTMLDivElement>}
        />
      </div>
    </main>
  );
}
