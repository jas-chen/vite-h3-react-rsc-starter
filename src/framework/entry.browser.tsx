import * as ReactClient from "@vitejs/plugin-rsc/browser";
import { getRscStreamFromHtml } from "@vitejs/plugin-rsc/rsc-html-stream/browser";
import React from "react";
import * as ReactDOMClient from "react-dom/client";
import type { RscPayload } from "./entry.rsc";

async function main() {
  // stash `setPayload` function to trigger re-rendering
  // from outside of `BrowserRoot` component (e.g. server function call, navigation, hmr)
  let setPayload: (v: RscPayload) => void;

  // deserialize RSC stream back to React VDOM for CSR
  const initialPayload = await ReactClient.createFromReadableStream<RscPayload>(
    // initial RSC stream is injected in SSR stream as <script>...FLIGHT_DATA...</script>
    getRscStreamFromHtml()
  );

  // browser root component to (re-)render RSC payload as state
  function BrowserRoot() {
    const [payload, setPayload_] = React.useState(initialPayload);

    React.useEffect(() => {
      setPayload = (v) => React.startTransition(() => setPayload_(v));
    }, [setPayload_]);

    return payload.root;
  }

  // re-fetch RSC and trigger re-rendering
  async function fetchRscPayload() {
    const payload = await ReactClient.createFromFetch<RscPayload>(
      fetch(window.location.href)
    );
    setPayload(payload);
  }

  // register a handler which will be internally called by React
  // on server function request after hydration.
  ReactClient.setServerCallback(async (id, args) => {
    const url = new URL(window.location.href);
    const temporaryReferences = ReactClient.createTemporaryReferenceSet();
    const payload = await ReactClient.createFromFetch<RscPayload>(
      fetch(url, {
        method: "POST",
        body: await ReactClient.encodeReply(args, { temporaryReferences }),
        headers: {
          "x-rsc-action": id,
        },
      }),
      { temporaryReferences }
    );
    setPayload(payload);
    return payload.returnValue;
  });

  // hydration
  const browserRoot = (
    <React.StrictMode>
      <BrowserRoot />
    </React.StrictMode>
  );
  ReactDOMClient.hydrateRoot(document, browserRoot, {
    formState: initialPayload.formState,
  });

  // implement server HMR by trigering re-fetch/render of RSC upon server code change
  if (import.meta.hot) {
    import.meta.hot.on("rsc:update", () => {
      fetchRscPayload();
    });
  }
}

main();
