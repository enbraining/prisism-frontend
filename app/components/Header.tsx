"use client";

import Link from "next/link";
import useSWR from "swr";
import { AxiosInstance } from "../util/axios";
import { IconEyeDotted } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const fetcher = (url: string) =>
    AxiosInstance.get(url).then((res) => res.data);
  const { data } = useSWR<{ count: number }>("/room/count", fetcher, {
    refreshInterval: 5000,
  });

  const [page, setPage] = useState<"CHAT" | "BOARD" | "INFO">("CHAT");

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/room")) setPage("CHAT");
    else if (pathname.startsWith("/board")) setPage("BOARD");
    else if (pathname.startsWith("/info")) setPage("INFO");
  }, [pathname]);

  return (
    <div className="w-full fixed top-0">
      <div className="mx-auto sm:w-1/2 bg-base-700">
        <nav className="bg-base-100 py-3 flex px-6 border-b border-base-300">
          <Link
            className="link text-base-content link-neutral text-lg font-semibold no-underline"
            href="/"
          >
            prisism
          </Link>
          <div className="ml-auto flex items-center gap-x-2 text-base-content">
            <IconEyeDotted size={20} />
            <p>{data?.count ?? 0}</p>
          </div>
        </nav>
        <nav className="bg-base-100 shadow-md rounded-b-xl grid grid-cols-3 text-neutral-400">
          <Link
            href={"/"}
            className={`${
              page === "CHAT" && "bg-base-200"
            } py-3 rounded-bl-xl hover:bg-base-shadow`}
          >
            <p className="text-center">채팅</p>
          </Link>
          <Link
            href={"/board"}
            className={`${
              page === "BOARD" && "bg-base-200"
            } py-3 hover:bg-base-shadow`}
          >
            <p className="text-center">게시판</p>
          </Link>
          <Link
            href={"/info"}
            className={`${
              page === "INFO" && "bg-base-200"
            } py-3 rounded-br-xl hover:bg-base-shadow`}
          >
            <p className="text-center">정보</p>
          </Link>
        </nav>
      </div>
    </div>
  );
}
