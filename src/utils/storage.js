export default {
  set(key, val) {
    window.localStorage[key] = val;
  },
  get(key) {
    return window.localStorage[key] || undefined;
  },
  setObject(key, val) {
    window.localStorage[key] = JSON.stringify(val);
  },
  getObject(key) {
    if (window.localStorage[key] === undefined) {
      return [];
    } else {
      return JSON.parse(window.localStorage[key]);
    }
  },
  del(key) {
    window.localStorage.removeItem(key);
  },
  clear() {
    window.localStorage.clear();
  },
};
