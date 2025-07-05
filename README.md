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
