import { GeneratedTypes, PayloadTypesShape, UntypedPayloadTypes } from 'payload'

export type Collections<
  T extends PayloadTypesShape = GeneratedTypes & Omit<UntypedPayloadTypes, keyof GeneratedTypes>,
> = T['collections']
