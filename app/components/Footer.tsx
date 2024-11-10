export default function Footer() {
  return (
    <footer className="footer mx-auto sm:w-1/2 w-[90%] bg-base-200/60 px-6 py-4">
      <div className="flex w-full items-center justify-between">
        <aside className="grid-flow-col items-center">
          <p>
            ©2024{" "}
            <a className="link link-hover font-medium" href="#">
              Prisism
            </a>
          </p>
        </aside>
        <div className="flex gap-4 h-5">
          <a
            href="https://github.com/prisism"
            className="link"
            aria-label="Github Link"
          >
            <span className="icon-[tabler--brand-github] size-5"></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
