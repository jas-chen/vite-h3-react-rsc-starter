import { formId } from "./formId";
import { NavigationFix } from "./NavigationFix";
import { handleNavigation, matchPage } from "./server";

export function Router({ request }: { request: Request }) {
  return (
    <>
      <NavigationFix />
      <form action={handleNavigation} id={formId} hidden>
        <button />
      </form>
      {matchPage.call(null, request)}
    </>
  );
}
