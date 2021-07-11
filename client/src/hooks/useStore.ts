import React from "react";

export const useStore = <T>(
  key: string,
  defaultValue: T,
  store: "session" | "local",
  prefix = ""
): [T, (t: T) => void] => {
  const storeKey = `${prefix}${key}`;
  const storage = store === "session" ? sessionStorage : localStorage;
  const [value, setValue] = React.useState(() => {
    const item = storage.getItem(storeKey);
    return item ? JSON.parse(item) : defaultValue;
  });

  const onChange = (t: T) => {
    sessionStorage.setItem(storeKey, JSON.stringify(t));
    setValue(t);
  };

  return [value, onChange];
};

export const useUserStore = <T>(
  key: string,
  defaultValue: T,
  store: "session" | "local"
): [T, (t: T) => void] => useStore(key, defaultValue, store, "User::");

export const getUserStore = <T>(key: string, store: Storage): T | undefined => {
  const item = store.getItem(`User::${key}`);
  return item ? JSON.parse(item) : undefined;
};

export const setUserStore = <T>(
  key: string,
  store: Storage,
  value: T | undefined
): void => {
  store.setItem(`User::${key}`, JSON.stringify(value));
};

export const clearUserStore = (): void => {
  [localStorage, sessionStorage].forEach((store) => {
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key?.startsWith("User::")) store.removeItem(key);
    }
  });
};
