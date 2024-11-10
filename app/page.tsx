"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      setRooms((await axios.get("http://localhost:3001/room")).data);
    };
    fetchRooms();
  }, [rooms]);

  return (
    <div className="grid">
      <ul className="sm:mx-auto px-16 mt-20">
        <div className="space-x-3 mb-6">
          <Link href={"/create"} className="btn btn-primary waves waves-light">
            방 만들기
          </Link>
          <Link
            href={"/random"}
            className="btn btn-soft btn-primary waves waves-primary"
          >
            랜덤한 채팅
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rooms.map((room: any) => (
              <Link
                href={`/room/${room.id}`}
                key={room.id}
                className="flex items-center space-x-3 rtl:space-x-reverse hover:cursor-pointer group"
              >
                <span className="bg-primary/20 group-hover:bg-primary/40 text-primary flex items-center justify-center rounded-full p-1">
                  <span className="group-hover:bg-slate-50 icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
                </span>
                <span className="grid grid-flow-col w-full">
                  <span className="text-base-content/80">{room.title}</span>
                  <span className="text-base-content/80 ml-auto">
                    {room.userCount}/{room.maxUser}
                  </span>
                </span>
              </Link>
            ))
          }
        </div>
      </ul>
    </div>
  );
}
