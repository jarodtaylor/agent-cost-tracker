import { expect, test } from "bun:test";

import { formatCurrency } from "./currency";

test("formats integer cents as US currency", () => {
  expect(formatCurrency(2000)).toBe("$20.00");
  expect(formatCurrency(1299)).toBe("$12.99");
  expect(formatCurrency(0)).toBe("$0.00");
});
