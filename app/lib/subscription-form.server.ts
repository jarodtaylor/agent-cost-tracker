export type SubscriptionFormValues = {
  name: string;
  vendor: string;
  monthlyCost: string;
  renewalDate: string;
  notes: string;
};

export type SubscriptionFieldErrors = Partial<
  Record<keyof Omit<SubscriptionFormValues, "notes">, string>
>;

type ParsedSubscription = {
  name: string;
  vendor: string;
  monthlyCost: number;
  renewalDate: string;
  notes: string | null;
};

type SubscriptionFormResult =
  | { success: true; data: ParsedSubscription }
  | {
      success: false;
      errors: SubscriptionFieldErrors;
      values: SubscriptionFormValues;
    };

function getString(formData: FormData, key: keyof SubscriptionFormValues) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function parseMonthlyCostInCents(value: string) {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) {
    return undefined;
  }

  const fractionalCents = (match[2] ?? "").padEnd(2, "0") || "0";
  const cents = BigInt(match[1]) * 100n + BigInt(fractionalCents);

  return cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) : undefined;
}

export function parseSubscriptionForm(formData: FormData): SubscriptionFormResult {
  const values: SubscriptionFormValues = {
    name: getString(formData, "name"),
    vendor: getString(formData, "vendor"),
    monthlyCost: getString(formData, "monthlyCost"),
    renewalDate: getString(formData, "renewalDate"),
    notes: getString(formData, "notes"),
  };
  const errors: SubscriptionFieldErrors = {};
  const name = values.name.trim();
  const vendor = values.vendor.trim();
  const monthlyCost = values.monthlyCost.trim();
  const renewalDate = values.renewalDate.trim();
  let monthlyCostInCents = 0;

  if (!name) {
    errors.name = "Name is required.";
  }

  if (!vendor) {
    errors.vendor = "Vendor is required.";
  }

  if (!monthlyCost) {
    errors.monthlyCost = "Monthly cost is required.";
  } else {
    const parsedMonthlyCost = parseMonthlyCostInCents(monthlyCost);
    if (parsedMonthlyCost === undefined) {
      errors.monthlyCost = "Enter a valid amount with up to two decimal places.";
    } else {
      monthlyCostInCents = parsedMonthlyCost;
    }
  }

  if (!renewalDate) {
    errors.renewalDate = "Renewal date is required.";
  } else if (!isValidIsoDate(renewalDate)) {
    errors.renewalDate = "Enter a valid renewal date.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  return {
    success: true,
    data: {
      name,
      vendor,
      monthlyCost: monthlyCostInCents,
      renewalDate,
      notes: values.notes.trim() || null,
    },
  };
}
