import { ServerCounter } from "../components/ServerCounter";
import { ClientCounter } from "../components/ClientCounter";

export async function HomePage() {
  return (
    <div>
      <h1>Vite + h3 + RSC</h1>
      <div className="card">
        <ClientCounter />
      </div>
      <div className="card">
        <ServerCounter />
      </div>
      <ul className="read-the-docs">
        <li>
          Edit <code>src/client.tsx</code> to test client HMR.
        </li>
        <li>
          Edit <code>src/root.tsx</code> to test server HMR.
        </li>
        <li>
          Visit{" "}
          <a href="/?__rsc" target="_blank">
            <code>/?__rsc</code>
          </a>{" "}
          to view RSC stream payload.
        </li>
        <li>
          Visit{" "}
          <a href="/?__nojs" target="_blank">
            <code>/?__nojs</code>
          </a>{" "}
          to test server action without js enabled.
        </li>
      </ul>
    </div>
  );
}
