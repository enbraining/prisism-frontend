"use client";

import axios from "axios";
import Link from "next/link";
import useSWR from "swr";

export default function Header() {
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);
  const { data } = useSWR<{ count: number }>(
    "http://localhost:3001/room/count",
    fetcher
  );

  return (
    <div className="w-full fixed">
      <nav className="navbar bg-base-700 mx-auto sm:w-1/2 shadow-md rounded-b-xl">
        <Link
          className="link text-base-content link-neutral text-lg font-semibold no-underline"
          href="/"
        >
          prisism
        </Link>
        <p className="ml-auto text-base-content">{data?.count}</p>
      </nav>
    </div>
  );
}
