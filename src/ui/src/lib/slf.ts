const block: (
  cb: (...args: any[]) => void,
  timeout?: number,
) => (...args: any[]) => void = (cb, timeout = 10) => {
  let isBlock: boolean = false;
  return (...args) => {
    if (isBlock) {
      return;
    }
    isBlock = true;
    cb(...args);
    setTimeout(() => {
      isBlock = false;
    }, timeout);
  };
};

export { block };
