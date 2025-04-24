"use client";

import { redirect } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import {
  decryptWithPrivateKey,
  encryptWithPublicKey,
  generateKeyPair,
} from "@/app/util/crypto";

import { toast } from "react-toastify";

export interface MessageRequest {
  message: string;
  client: string;
}

export default function Page() {
  const messageRef = useRef<HTMLDivElement>();
  const socketRef = useRef<Socket | null>(null);

  const [chats, setChats] = useState<MessageRequest[]>([
    {
      client: "JOIN",
      message: "매칭을 대기중입니다.",
    },
  ]);
  const [message, setMessage] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [status, setStatus] = useState<"JOIN" | "END" | null>(null);

  const chatScrollDown = () => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "end",
    });
  };

  const sendPublicKey = useCallback(async () => {
    const keyPair = await generateKeyPair();
    localStorage.setItem("my-private-key", keyPair.privateKey);

    socketRef.current?.emit("send-e2ee", {
      publicKey: keyPair.publicKey,
    });
  }, []);

  const sentPublicKey = useCallback(
    (data: { publicKey: string; keyOwner: string }) => {
      if (socketRef.current?.id != data.keyOwner) {
        localStorage.setItem("other-public-key", data.publicKey);
      }
    },
    []
  );

  const onQuit = useCallback(() => {
    socketRef.current?.disconnect();

    localStorage.removeItem("my-private-key");
    localStorage.removeItem("other-public-key");

    redirect("/");
  }, [socketRef]);

  const handleMessage = useCallback(async (data: MessageRequest) => {
    if (data.client !== socketRef.current?.id) {
      const privateKey = localStorage.getItem("my-private-key") as string;
      const decodedMessage = decryptWithPrivateKey(privateKey, data.message);

      if (decodedMessage != false) {
        data["message"] = decodedMessage;
      }

      setChats((prev) => [...prev, data]);
    }

    chatScrollDown();
  }, []);

  const handleNotice = useCallback(async (data: MessageRequest) => {
    if (data.client == "JOIN") setStatus("JOIN");
    else if (data.client == "END") setStatus("END");

    setChats((prev) => [...prev, data]);
    chatScrollDown();
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
        if (!message.trim() || !socketRef.current) return;

        if (message.length > 80) {
          toast.warning("80자를 초과해서 전송할 수 없습니다.");
          setMessage("");
          return;
        }

        const publicKey = localStorage.getItem("other-public-key") as string;

        socketRef.current?.emit("pub-message", {
          message: encryptWithPublicKey(publicKey, message).toString(),
        });

        if (socketRef.current) {
          setChats((prev) => [
            ...prev,
            {
              id: 1,
              message: message.trim(),
              client: socketRef.current?.id ?? "",
            },
          ]);
        }

        setMessage("");
        e.preventDefault();
      }

      chatScrollDown();
    },
    [message, socketRef]
  );

  // 채팅이 종료되지 않은 경우에만 입력할 수 있게
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: ChangeEvent | any) => {
      e.preventDefault();
      if (status == "JOIN") setMessage(e.target.value);
    },
    [status]
  );

  const onConnect = () => {
    socketRef.current?.emit("random-join");
  };

  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/chat`, {
      transports: ["websocket"],
      path: "/socket.io/",
    });
    socketRef.current = newSocket;

    socketRef.current.on("connect", onConnect);

    socketRef.current.on("get-room", (data) => {
      setRoomId(data.roomId);
      socketRef.current?.on(`sub-message-${data.roomId}`, handleMessage);
      socketRef.current?.on(`sub-notice-${data.roomId}`, handleNotice);
      socketRef.current?.on(`start-e2ee-${data.roomId}`, sendPublicKey);
      socketRef.current?.on(`sent-e2ee-${data.roomId}`, sentPublicKey);
    });

    socketRef.current.on("error", (error) => {
      alert(error.message);
      redirect("/");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("error");
        socketRef.current.off(`sub-message-${roomId}`);
        socketRef.current.off(`sub-notice-${roomId}`);
        socketRef.current.off(`start-e2ee-${roomId}`);
        socketRef.current.off(`sent-e2ee-${roomId}`);
        socketRef.current.off(`get-room`);
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <main>
      <div className="bg-base-200 mx-auto sm:w-1/2 w-full overflow-y-scroll p-5 pt-15 h-[100vh]">
        {chats.map((chat, index) =>
          chat.client == "JOIN" || chat.client == "END" ? (
            <div className="w-full flex my-3 text-neutral-500" key={index}>
              <p className="mx-auto">{chat.message}</p>
            </div>
          ) : (
            <div
              key={index}
              className={`w-fit mb-2 rounded-md px-4 py-3 break-words whitespace-pre-wrap ${
                chat.client == socketRef.current?.id
                  ? "ml-auto bg-[#7422c1]"
                  : "mr-auto bg-[#2f2a34]"
              }`}
            >
              {chat.message}
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
