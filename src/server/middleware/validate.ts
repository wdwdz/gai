
import { Schema } from 'joi'
import { NextRequest } from 'next/server'
import cloneDeep from "lodash/cloneDeep"

export async function validateMiddleware(req: NextRequest, schema?: Schema) {
  if (!schema) return

  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  }

  const body = await req.json()
  const { error } = schema.validate(cloneDeep(body), options)

  if (error) {
    throw `Validation error: ${error.details.map(x => x.message).join(', ')}`
  }

  req.json = () => body
}

