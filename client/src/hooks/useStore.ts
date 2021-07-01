import React from "react";

export const useStore = <T>(
  key: string,
  defaultValue: T,
  store: "session" | "local" = "local"
): [T, (t: T) => void] => {
  const storage = store === "session" ? sessionStorage : localStorage;
  const [value, setValue] = React.useState(() => {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  });

  const onChange = (t: T) => {
    sessionStorage.setItem(key, JSON.stringify(t));
    setValue(t);
  };

  return [value, onChange];
};
