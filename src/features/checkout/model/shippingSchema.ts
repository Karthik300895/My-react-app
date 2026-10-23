import { z } from 'zod'

// FR25: the shipping form's rules. Messages are written for the Shopper and name the fix.
const requiredText = (label: string) =>
  z.string().trim().min(1, `Enter your ${label}.`)

export const shippingSchema = z.object({
  fullName: requiredText('full name'),
  email: z.email('Enter a valid email, like name@example.com.'),
  phone: z.string().refine((value) => {
    const digits = value.replace(/\D/g, '')
    return (
      /^\+?[\d\s().-]+$/.test(value) &&
      digits.length >= 7 &&
      digits.length <= 15
    )
  }, 'Enter a phone number with 7 to 15 digits, like +1 555 010 9999.'),
  addressLine1: requiredText('street address'),
  addressLine2: z.string().trim(),
  city: requiredText('city'),
  state: requiredText('state or region'),
  postalCode: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9]{3,10}$/,
      'Enter a postal code of 3 to 10 letters or digits.',
    ),
  country: requiredText('country'),
})

export type ShippingValues = z.infer<typeof shippingSchema>

/** The order the fields appear in, which is also the order focus moves through on failure. */
export const SHIPPING_FIELD_ORDER = [
  'fullName',
  'email',
  'phone',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
] as const satisfies readonly (keyof ShippingValues)[]

export type ShippingField = (typeof SHIPPING_FIELD_ORDER)[number]

/** The autocomplete attribute for each field (UX-DR17). */
export const SHIPPING_AUTOCOMPLETE: Record<ShippingField, string> = {
  fullName: 'name',
  email: 'email',
  phone: 'tel',
  addressLine1: 'address-line1',
  addressLine2: 'address-line2',
  city: 'address-level2',
  state: 'address-level1',
  postalCode: 'postal-code',
  country: 'country-name',
}

export const SHIPPING_LABELS: Record<ShippingField, string> = {
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  addressLine1: 'Address line 1',
  addressLine2: 'Address line 2',
  city: 'City',
  state: 'State or region',
  postalCode: 'Postal code',
  country: 'Country',
}

export const OPTIONAL_FIELDS: ShippingField[] = ['addressLine2']
