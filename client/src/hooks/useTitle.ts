import { useEffect } from "react";

const defaultTitle = "NotionViz";

const useTitle = (title: string): void => {
  useEffect(() => {
    document.title = `${title} | ${defaultTitle}`;
    return () => {
      document.title = defaultTitle;
    };
  }, [title]);
};

export default useTitle;
