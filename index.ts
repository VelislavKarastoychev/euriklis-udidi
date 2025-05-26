"use strict";

import { password } from "bun";
import { UdidiClient } from "./src";
import { Udidi } from "./src/Udidi";

const udidi = new UdidiClient();
const udidi1 = new UdidiClient();
const udidi2 = new UdidiClient();
udidi.database = "clients";
udidi2.database = "USERS";

udidi1.database = "users";
udidi1.port = 2000; // intentionally set to a port where no server is running

try {
  console.log("Default connection:", await udidi.testConnection());
} catch (err) {
  console.error("Default connection error:", err);
}

try {
  console.log("udidi1 connection:", await udidi1.testConnection());
} catch (err) {
  console.error("udidi1 connection error:", err);
}

try {
  console.log("udidi2 connection:", await udidi2.testConnection());
} catch (err) {
  console.error("udidi2 connection error:", err);
}

const user = Udidi.object({
  username: Udidi.string().hasLengthGreaterThan(2),
  password: Udidi.string().hasLengthGreaterThan(4),
  age: Udidi.number().isInClosedRange(18, Infinity),
});

type userType = Udidi.Infer<typeof user>;

const numberLike = Udidi.number()
  .and(
    Udidi.number().not(
      Udidi.number().isPositiveInfinity.or(Udidi.number().isNegativeInfinity),
    ),
  )
  .or(Udidi.string());

// console.log(numberLike.serializedSchema);

type nl = Udidi.Infer<typeof numberLike>;

const arr = Udidi.typedArray().range(-1, 1);
arr.description = "An array of numbers or strings";
// console.log(arr.serializedSchema);
type arrType = Udidi.Infer<typeof arr>;

const obj = Udidi.object({
  name: Udidi.string(),
  age: Udidi.number(),
  scores: Udidi.array(Udidi.number().or(Udidi.string())).optional(),
});
const obj1 = obj.extend({ family: Udidi.string() }).optional();
// console.log(obj1.serializedSchema);
const obj2 = obj1.pick("name");
console.log(obj1.serializedSchema);

type objType = Udidi.Infer<typeof obj1>;

type objType1 = Udidi.Infer<typeof obj2>;
