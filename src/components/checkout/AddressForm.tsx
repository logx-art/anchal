"use client";

export type AddressFormValues = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export function AddressForm({
  values,
  onChange,
  errors,
}: {
  values: AddressFormValues;
  onChange: (values: AddressFormValues) => void;
  errors?: Partial<Record<keyof AddressFormValues, string>>;
}) {
  function field(key: keyof AddressFormValues, label: string, span = 1) {
    return (
      <div className={span === 2 ? "sm:col-span-2" : undefined}>
        <label className="mb-1 block text-sm text-charcoal" htmlFor={key}>
          {label}
        </label>
        <input
          id={key}
          value={values[key]}
          onChange={(e) => onChange({ ...values, [key]: e.target.value })}
          className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
        />
        {errors?.[key] && <p className="mt-1 text-xs text-terracotta">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {field("fullName", "Full Name", 2)}
      {field("phone", "Phone Number")}
      {field("line1", "Address")}
      {field("line2", "Apartment, suite, etc. (optional)", 2)}
      {field("city", "City")}
      {field("state", "State")}
      {field("pincode", "PIN Code")}
    </div>
  );
}
