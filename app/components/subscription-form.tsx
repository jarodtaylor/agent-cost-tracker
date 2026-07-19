import { AlertCircle, ArrowLeft } from "lucide-react";
import { Form, Link, useNavigation } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type {
  SubscriptionFieldErrors,
  SubscriptionFormValues,
} from "~/lib/subscription-form.server";

type SubscriptionFormProps = {
  cancelHref?: string;
  errors?: SubscriptionFieldErrors;
  submitLabel: string;
  values?: Partial<SubscriptionFormValues>;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="flex items-center gap-1.5 text-sm font-medium text-destructive">
      <AlertCircle aria-hidden="true" className="size-4" />
      <span>{message}</span>
    </p>
  );
}

export function SubscriptionForm({
  cancelHref = "/",
  errors = {},
  submitLabel,
  values = {},
}: SubscriptionFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={values.name}
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            autoComplete="off"
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">
            Vendor <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="vendor"
            name="vendor"
            defaultValue={values.vendor}
            aria-required="true"
            aria-invalid={Boolean(errors.vendor)}
            aria-describedby={errors.vendor ? "vendor-error" : undefined}
            autoComplete="organization"
          />
          <FieldError id="vendor-error" message={errors.vendor} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyCost">
            Monthly cost (USD) <span aria-hidden="true">*</span>
          </Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
            >
              $
            </span>
            <Input
              id="monthlyCost"
              name="monthlyCost"
              type="text"
              inputMode="decimal"
              placeholder="20.00"
              defaultValue={values.monthlyCost}
              className="pl-7"
              aria-required="true"
              aria-invalid={Boolean(errors.monthlyCost)}
              aria-describedby={errors.monthlyCost ? "monthlyCost-error" : undefined}
            />
          </div>
          <FieldError id="monthlyCost-error" message={errors.monthlyCost} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="renewalDate">
            Renewal date <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="renewalDate"
            name="renewalDate"
            type="date"
            defaultValue={values.renewalDate}
            aria-required="true"
            aria-invalid={Boolean(errors.renewalDate)}
            aria-describedby={errors.renewalDate ? "renewalDate-error" : undefined}
          />
          <FieldError id="renewalDate-error" message={errors.renewalDate} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Optional context about the plan or account"
          defaultValue={values.notes}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <Button asChild variant="ghost">
          <Link to={cancelHref}>
            <ArrowLeft aria-hidden="true" />
            Back to subscriptions
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
