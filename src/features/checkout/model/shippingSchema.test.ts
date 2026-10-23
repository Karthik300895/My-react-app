import { describe, expect, it } from 'vitest'
import { shippingSchema, type ShippingValues } from './shippingSchema'

const valid: ShippingValues = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 010 9999',
  addressLine1: '10 Downing Street',
  addressLine2: '',
  city: 'London',
  state: 'Greater London',
  postalCode: 'SW1A2AA',
  country: 'United Kingdom',
}

const errorsFor = (overrides: Partial<ShippingValues>) => {
  const result = shippingSchema.safeParse({ ...valid, ...overrides })
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((i) => [i.path[0], i.message]),
  )
}

describe('shippingSchema', () => {
  it('FR25: a complete, well-formed address passes', () => {
    expect(shippingSchema.safeParse(valid).success).toBe(true)
  })

  it('FR25: required fields must not be empty or only spaces', () => {
    expect(errorsFor({ fullName: '   ' })).toHaveProperty(
      'fullName',
      'Enter your full name.',
    )
    expect(errorsFor({ city: '' })).toHaveProperty('city', 'Enter your city.')
    expect(errorsFor({ country: '' })).toHaveProperty('country')
  })

  it('FR25: address line 2 is optional', () => {
    expect(errorsFor({ addressLine2: '' })).toEqual({})
  })

  it('FR25: the email must be well formed', () => {
    expect(errorsFor({ email: 'not-an-email' })).toHaveProperty(
      'email',
      'Enter a valid email, like name@example.com.',
    )
  })

  it('FR25: the phone must contain 7 to 15 digits', () => {
    expect(errorsFor({ phone: '12345' })).toHaveProperty('phone')
    expect(errorsFor({ phone: '1234567' })).toEqual({})
    expect(errorsFor({ phone: '1234567890123456' })).toHaveProperty('phone')
    expect(errorsFor({ phone: 'call me' })).toHaveProperty('phone')
  })

  it('FR25: the postal code must be 3 to 10 alphanumeric characters', () => {
    expect(errorsFor({ postalCode: 'AB' })).toHaveProperty('postalCode')
    expect(errorsFor({ postalCode: 'ABC' })).toEqual({})
    expect(errorsFor({ postalCode: 'ABCDEFGHIJK' })).toHaveProperty(
      'postalCode',
    )
    expect(errorsFor({ postalCode: 'AB-12' })).toHaveProperty('postalCode')
  })
})
