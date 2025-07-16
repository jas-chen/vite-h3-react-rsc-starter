"use server";

import { getServerCounter, updateServerCounter } from "./action.tsx";

export async function ServerCounter() {
  return (
    <>
      <form action={updateServerCounter.bind(null, 1)}>
        <button>Server Counter: {getServerCounter()}</button>
      </form>
    </>
  );
}
