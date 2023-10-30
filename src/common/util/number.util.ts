export const range = (x: number, y: number, step = 1) =>
  Array.from(
    (function* () {
      while (x <= y) {
        yield x;
        x += step;
      }
    })(),
  );
