# udidi

**Udidi** is a TypeScript-first schema validator and type inference library.  
Modeled after [Zod](https://github.com/colinhacks/zod) but custom-tuned for integration with the Udidi Graph Database, Udidi lets you:

- **Define** schemas via a fluent, chainable API
- **Validate** data at runtime
- **Infer** TypeScript types with `Udidi.Infer<T>()`

## 🚀 Features

- **Fluent, expressive API**

  ```ts
  const User = udidi
    .object({
      id: udidi.string(),
      age: udidi.number().isInteger.isPositive,
      email: udidi.string().email(),
    })
    .strict();
  type User = udidi.infer<typeof User>;
  ```

- **Zero-dependencies** — fantastic tree-shaking for frontend/back­
  end alike.

- **Comprehensive validation:** unions, intersections, enums, tuples, custom refinements, and more.

Automatic type inference so you get full compile-time safety.

- **Seamless integration** with Udidi Graph Database for query building and execution.

# 📦 Installation

```sh

# via npm
npm install @euriklis/udidi

# via yarn
yarn add @euriklis/udidi

# via bun

bun add @euriklis/udidi
```

# 🔨 Basic Usage

```ts
import udidi from "udidi";

// Define a schema
const Product = udidi.object({
  sku: udidi.string(),
  price: udidi.number().min(0),
  tags: udidi.array(udidi.string()),
});

// Parse & validate
const data = JSON.parse(input);
const valid = Product.parse(data);

// Infer static TS type
type Product = Udidi.infer<typeof Product>;
```

`parse` will throw an error if the data does not satisfy the schema. If you
prefer a non‑throwing variant you can use `safeParse` which returns an object
containing a `success` flag and a list of errors:

```ts
const result = Product.safeParse(data);
if (!result.success) {
  console.error(result.errors);
}
```

## API Overview

Udidi exposes helpers for most built‑in JavaScript types. The most common
factory methods are:

- `udidi.string()` – validates strings
- `udidi.number()` – validates numbers and provides `.gt`, `.lt`, `.range` and
  more helpers
- `udidi.boolean()` – validates booleans
- `udidi.array(schema)` – validates arrays of a given schema
- `udidi.object(shape)` – validates object shapes
- `udidi.int8Array()` / `udidi.uint8Array()` – typed array support
- `udidi.enum(values)` – validates enum-like values
- `udidi.set(schema)` – validates `Set` instances
- `udidi.map(keySchema, valueSchema)` – validates `Map` entries

All schema instances share the `.parse()` and `.safeParse()` methods shown
above.

## 🔍 String Validation Helpers

Udidi's `string()` schema offers format-specific checks for common patterns. These methods can be chained like any other rule.

```ts
// Require a UUID v4 string
const id = udidi.string().uuid({ version: "v4" });

// Expect an ISO 8601 date (YYYY-MM-DD)
const birthday = udidi.string().iso.date();

// Validate IP addresses or networks
const ipv4 = udidi.string().ipv4();
const cidr6 = udidi.string().cidrv6();
```

Each helper will cause `.parse()` or `.safeParse()` to fail if the string does not match the expected format.
