import { describe, expect, test } from "bun:test";

import { parseSubscriptionForm } from "./subscription-form.server";

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

const validValues = {
  name: "Claude Pro",
  vendor: "Anthropic",
  monthlyCost: "20.00",
  renewalDate: "2026-08-01",
  notes: "Primary coding assistant",
};

describe("parseSubscriptionForm", () => {
  test("normalizes valid form values for persistence", () => {
    const result = parseSubscriptionForm(formData(validValues));

    expect(result).toEqual({
      success: true,
      data: {
        name: "Claude Pro",
        vendor: "Anthropic",
        monthlyCost: 2000,
        renewalDate: "2026-08-01",
        notes: "Primary coding assistant",
      },
    });
  });

  test("returns a field-level error for every missing required value", () => {
    const result = parseSubscriptionForm(
      formData({
        name: "  ",
        vendor: "",
        monthlyCost: "",
        renewalDate: "",
        notes: "",
      }),
    );

    expect(result).toEqual({
      success: false,
      errors: {
        name: "Name is required.",
        vendor: "Vendor is required.",
        monthlyCost: "Monthly cost is required.",
        renewalDate: "Renewal date is required.",
      },
      values: {
        name: "  ",
        vendor: "",
        monthlyCost: "",
        renewalDate: "",
        notes: "",
      },
    });
  });

  test("rejects malformed money and impossible dates", () => {
    const result = parseSubscriptionForm(
      formData({
        ...validValues,
        monthlyCost: "19.999",
        renewalDate: "2026-02-30",
      }),
    );

    expect(result).toMatchObject({
      success: false,
      errors: {
        monthlyCost: "Enter a valid amount with up to two decimal places.",
        renewalDate: "Enter a valid renewal date.",
      },
    });
  });

  test("stores blank optional notes as null", () => {
    const result = parseSubscriptionForm(
      formData({ ...validValues, notes: "   " }),
    );

    expect(result).toMatchObject({ success: true, data: { notes: null } });
  });

  test("accepts the maximum safe integer-cent amount", () => {
    const result = parseSubscriptionForm(
      formData({ ...validValues, monthlyCost: "90071992547409.91" }),
    );

    expect(result).toMatchObject({
      success: true,
      data: { monthlyCost: Number.MAX_SAFE_INTEGER },
    });
  });

  test("rejects the first amount above safe integer cents", () => {
    const result = parseSubscriptionForm(
      formData({ ...validValues, monthlyCost: "90071992547409.92" }),
    );

    expect(result).toEqual({
      success: false,
      errors: {
        monthlyCost: "Enter a valid amount with up to two decimal places.",
      },
      values: { ...validValues, monthlyCost: "90071992547409.92" },
    });
  });
});
