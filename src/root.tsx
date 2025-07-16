import "./index.css"; // css import is automatically injected in exported server components
import viteLogo from "./assets/vite.svg";
import reactLogo from "./assets/react.svg";
import { Link } from "./router/Link";
import { Router } from "./router";

export function Root(props: { request: Request }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + RSC</title>
      </head>
      <body>
        <App {...props} />
      </body>
    </html>
  );
}

function App({ request }: { request: Request }) {
  return (
    <div id="root">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a
          href="https://react.dev/reference/rsc/server-components"
          target="_blank"
        >
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
      </ul>
      <Router request={request} />
    </div>
  );
}
