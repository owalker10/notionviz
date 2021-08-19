import useWindowSize from "./useWindowSize";

export default (breakpoint: number): boolean => {
  const { width } = useWindowSize();
  return width ? width < breakpoint : false;
};
