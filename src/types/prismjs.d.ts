declare module "prismjs" {
  const Prism: {
    highlightElement: (element: Element) => void;
  };
  export default Prism;
}

declare module "prismjs/components/*";

