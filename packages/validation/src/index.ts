export * from "./zodSchema"

// Re-exported so consumers can branch on validation failures without taking a
// direct dependency on zod (and so `instanceof` narrowing works everywhere).
export { ZodError } from "zod"
