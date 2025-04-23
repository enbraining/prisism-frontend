"use client";

import { redirect } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

import levelUpAudio from "../../sounds/levelUpAudio.wav";
import { toast } from "react-toastify";

export interface MessageRequest {
  id: number;
  message: string;
  client: string;
}

export default function Page() {
  const messageRef = useRef<HTMLDivElement>();
  const socketRef = useRef<Socket | null>(null);

  const [chats, setChats] = useState<MessageRequest[]>([
    {
      client: "JOIN",
      id: 0,
      message: "매칭을 대기중입니다.",
    },
  ]);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [message, setMessage] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [status, setStatus] = useState<"JOIN" | "END" | null>(null);

  const handleMessage = (data: MessageRequest) => {
    if (data.client == "JOIN") {
      audio?.play();
      setStatus("JOIN");
    } else if (data.client == "END") setStatus("END");

    if (data.client !== socketRef.current?.id) {
      setChats((prev) => [...prev, data]);
    }
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "end",
    });
  };

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
        if (!message.trim() || !socketRef.current) return;

        if (message.length > 80) {
          toast.warning("80자를 초과해서 전송할 수 없습니다.");
          setMessage("");
          return;
        }

        socketRef.current?.emit("pub-message", {
          message: message.trim(),
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
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "end",
      });
    },
    [chats, message, socketRef]
  );

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: ChangeEvent | any) => {
      e.preventDefault();
      if (status == "JOIN") setMessage(e.target.value);
    },
    [status]
  );

  const onQuit = useCallback(() => {
    socketRef.current?.disconnect();
    redirect("/");
  }, [socketRef]);

  const onRestart = useCallback(() => {
    setChats([
      {
        client: "JOIN",
        id: 0,
        message: "매칭을 대기중입니다.",
      },
    ]);

    const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/chat`, {
      transports: ["websocket"],
      path: "/socket.io/",
    });
    socketRef.current = newSocket;

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("random-join");
    });

    socketRef.current.on("get-room", (data) => {
      setRoomId(data.roomId);
      socketRef.current?.on(`sub-message-${data.roomId}`, handleMessage);
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
        socketRef.current.off(`get-room`);
        socketRef.current.disconnect();
      }
    };
  }, [socketRef]);

  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/chat`, {
      transports: ["websocket"],
      path: "/socket.io/",
    });
    socketRef.current = newSocket;

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("random-join");
    });

    socketRef.current.on("get-room", (data) => {
      setRoomId(data.roomId);
      socketRef.current?.on(`sub-message-${data.roomId}`, handleMessage);
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
        socketRef.current.off(`get-room`);
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setAudio(new Audio(levelUpAudio));
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
              className={`w-fit mb-2 rounded-md px-4 py-3 ${
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
          {status == "END" ? (
            <button className="btn btn-primary" onClick={onRestart}>
              재시작
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onQuit}>
              나가기
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
