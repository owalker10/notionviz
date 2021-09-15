import React from "react";

interface StorageItem<T> {
  data: T;
  expiration: number | undefined;
}

const EXPIRATION = 3 * 60000; // miliseconds

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

// implement expiration
// export const useUserStore = <T>(
//   key: string,
//   defaultValue: T,
//   store: "session" | "local"
// ): [T, (t: T) => void] => useStore(key, defaultValue, store, "User::");

export const getUserStore = <T>(key: string, store: Storage): T | undefined => {
  const itemJSON = store.getItem(`User::${key}`);
  const item = itemJSON ? (JSON.parse(itemJSON) as StorageItem<T>) : undefined;
  if (!item || !item.data) return undefined;
  if (item.expiration && item.expiration < Date.now()) return undefined;
  return item.data;
};

export const setUserStore = <T>(
  key: string,
  store: Storage,
  value: T | undefined,
  expiration: number | undefined = EXPIRATION
): void => {
  const item = {
    data: value,
    expiration:
      store === localStorage && expiration
        ? Date.now() + expiration
        : undefined,
  };
  store.setItem(`User::${key}`, JSON.stringify(item));
};

export const removeUserStore = (key: string, store: Storage): void => {
  store.removeItem(`User::${key}`);
};

export const clearUserStore = (): void => {
  [localStorage, sessionStorage].forEach((store) => {
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key?.startsWith("User::")) store.removeItem(key);
    }
  });
};
