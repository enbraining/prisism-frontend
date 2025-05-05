"use client";

import Link from "next/link";
import useSWR from "swr";
import { AxiosInstance } from "../util/axios";
import { IconEyeDotted } from "@tabler/icons-react";

export default function Header() {
  const fetcher = (url: string) =>
    AxiosInstance.get(url).then((res) => res.data);
  const { data } = useSWR<{ count: number }>("/room/count", fetcher, {
    refreshInterval: 5000,
  });

  return (
    <div className="w-full fixed z-10">
      <nav className="navbar bg-base-700 mx-auto sm:w-1/2 shadow-md rounded-b-xl">
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
    </div>
  );
}
