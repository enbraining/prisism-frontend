"use client";

import { redirect, useParams } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface MessageRequest {
  id: number;
  message: string;
  client: string;
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
    [chats, message, socketRef]
  );

  useEffect(() => {
    const roomId = params.id;
    const newSocket = io("http://183.105.197.228:3030/chat", {
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
      <div className="bg-base-200 mx-auto sm:w-1/2 w-full overflow-y-auto p-5 pt-15 h-[100vh]">
        {chats.map((chat, index) => (
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
        ))}
        <div ref={messageRef as React.RefObject<HTMLDivElement>} />
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
