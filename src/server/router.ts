export function match(pathname: string) {
  switch (pathname) {
    case "/":
      return "HOME";
    case "/about":
      return "ABOUT";
    default:
      return undefined;
  }
}
