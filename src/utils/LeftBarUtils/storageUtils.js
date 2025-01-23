export function saveToLocalStorage(key, value) {
  // If all you want is to store the entire new value:
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
