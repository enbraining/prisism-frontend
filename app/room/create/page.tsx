"use client";

import { AxiosInstance } from "@/app/util/axios";
import { redirect } from "next/navigation";
import { useCallback, useState } from "react";

export default function Page() {
  const [count, setCount] = useState(2);
  const [isWrong, setWrong] = useState(false);

  const onSubmit = useCallback((formDate: FormData) => {
    const createRoom = async () => {
      const title = formDate.get("title") as string | null;
      const maxUser = formDate.get("count") as string | null;

      if (!title || title.length > 20) setWrong(true);
      else {
        await AxiosInstance.post("/room", {
          title,
          maxUser,
        });

        redirect("/");
      }
    };
    createRoom();
  }, []);

  return (
    <main className="grid">
      <div className="pt-20 min-h-screen mx-auto sm:w-1/2 w-[90%]">
        <form action={onSubmit}>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">방 이름</span>
            </div>
            <input
              type="text"
              name="title"
              placeholder="프리시즘이 최고야"
              className={`input input-lg ${isWrong && "is-invalid"}`}
            />
          </label>

          <div className="input-group mt-4 max-w-xs" data-input-number>
            <span className="input-group-text border-base-content/25 border-e ps-0">
              <button
                type="button"
                className="flex size-12 items-center justify-center"
                aria-label="Decrement button"
                data-input-number-decrement
                onClick={() => {
                  if (count > 2) setCount(count - 1);
                }}
              >
                <span className="icon-[tabler--minus] size-3.5 flex-shrink-0"></span>
              </button>
            </span>
            <input
              className="input pb-0.5 text-center"
              id="number-input-bucket"
              type="text"
              name="count"
              value={count}
              aria-label="Bucket counter"
              data-input-number-input
              readOnly
            />
            <div className="absolute bottom-1 start-1/2 flex -translate-x-1/2  items-center rtl:translate-x-1/2">
              <span className="icon-[tabler--ghost] text-base-content/80 me-2"></span>
              <span className="text-xs text-base-content/80 text-nowrap">
                최대 인원수
              </span>
            </div>
            <span className="input-group-text border-base-content/25 border-s pe-0">
              <button
                type="button"
                className="flex size-12 items-center justify-center"
                aria-label="Increment button"
                data-input-number-increment
                onClick={() => {
                  if (count < 10) setCount(count + 1);
                }}
              >
                <span className="icon-[tabler--plus] size-3.5 flex-shrink-0"></span>
              </button>
            </span>
          </div>

          <button className="btn btn-soft btn-primary mt-8">생성하기</button>
        </form>
      </div>
    </main>
  );
}
