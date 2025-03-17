type CaseConverter<T> = T extends object
  ? { [K in keyof T]: CaseConverter<T[K]> }
  : T;

export const toCamelCase = (str: string): string =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );

export const toSnakeCase = (str: string): string =>
  str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");

export const convertKeysToCamelCase = <T extends object>(
  obj: T
): CaseConverter<T> => {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" ? convertKeysToCamelCase(item) : item
    ) as CaseConverter<T>;
  }

  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      newObj[camelKey] =
        obj[key] && typeof obj[key] === "object"
          ? convertKeysToCamelCase(obj[key] as object)
          : obj[key];
    }
  }
  return newObj as CaseConverter<T>;
};

export const convertKeysToSnakeCase = <T extends object>(
  obj: T
): CaseConverter<T> => {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" ? convertKeysToSnakeCase(item) : item
    ) as CaseConverter<T>;
  }

  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key);
      newObj[snakeKey] =
        obj[key] && typeof obj[key] === "object"
          ? convertKeysToSnakeCase(obj[key] as object)
          : obj[key];
    }
  }
  return newObj as CaseConverter<T>;
};
