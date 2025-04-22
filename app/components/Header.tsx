import Link from "next/link";

export default function Header() {
  return (
    <nav className="navbar bg-base-700 mx-auto sm:w-1/2 w-[90%] rounded-b-lg shadow-md">
      <Link
        className="link text-base-content link-neutral text-lg font-semibold no-underline text-center w-full"
        href="/"
      >
        prisism
      </Link>
    </nav>
  );
}
