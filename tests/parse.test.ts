import { test, expect } from "bun:test";
import { udidi } from "../src";

test("safeParse succeeds for valid input", () => {
  const positiveInt = udidi.number().gt(0);
  const result = positiveInt.safeParse(5);
  expect(result.success).toBe(true);
});

test("safeParse fails for invalid input", () => {
  const positiveInt = udidi.number().gt(0);
  const result = positiveInt.safeParse(-2);
  expect(result.success).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});

test("parse throws on invalid input", () => {
  const positiveInt = udidi.number().gt(0);
  expect(() => positiveInt.parse(-1)).toThrow();
});

test("nullable number schema accepts numbers and null", () => {
  const schema = udidi.number().nullable();
  expect(schema.safeParse(5).success).toBe(true);
  expect(schema.safeParse(null).success).toBe(true);
});

test("nullable object schema accepts object or null", () => {
  const schema = udidi
    .object({
      name: udidi.string().match(/[0-9a-zA-Z]/),
      age: udidi.number().isInteger,
    })
    .nullable();

  expect(schema.safeParse({ name: "Ivan", age: 12 }).success).toBe(true);
  expect(schema.safeParse(null).success).toBe(true);
});

test("nullish number schema accepts number, null or undefined", () => {
  const schema = udidi.number().nullish();
  expect(schema.safeParse(5).success).toBe(true);
  expect(schema.safeParse(null).success).toBe(true);
  expect(schema.safeParse(undefined).success).toBe(true);
});

test("typed array validation", () => {
  const schema = udidi.int8Array().hasLength(2);
  expect(schema.safeParse(new Int8Array([1, 2])).success).toBe(true);
  expect(schema.safeParse(new Int8Array([1, 2, 3])).success).toBe(false);
});

test("parse validate correctly the same method:", () => {
  const myBuffer = new Float64Array([Math.PI, Math.E]).buffer;
  const myClonedBuffer = new Float64Array([Math.PI, Math.E]).buffer;
  const myTypedArray = new Float32Array([1, Math.PI, Math.E, Math.exp(2)]);
  const myClonedTypedArray = new Float32Array([
    1,
    Math.PI,
    Math.E,
    Math.exp(2),
  ]);
  const schema = udidi.object({
    age: udidi.number().isInteger.isPositive.equals(39),
    name: udidi.string().equals("John"),
    scores: udidi
      .array(udidi.number().isFloat)
      .equals([1.1, 6.5, 4.999])
      .hasLength(3),
    buffer: udidi.arrayBuffer().equals(myBuffer),
    typedArray: udidi.float32Array().equals(myTypedArray),
  });
  const student: udidi.Infer<typeof schema> = {
    age: 39,
    name: "John",
    scores: [1.1, 6.5, 4.999],
    buffer: myClonedBuffer,
    typedArray: myClonedTypedArray,
  };
  expect(() => schema.parse(student)).not.toThrow();
});

test("any schema accepts arbitrary values", () => {
  const schema = udidi.any();
  expect(schema.safeParse(123).success).toBe(true);
  expect(schema.safeParse("hello").success).toBe(true);
});

test("never schema rejects all values", () => {
  const schema = udidi.never();
  expect(schema.safeParse(123).success).toBe(false);
  expect(schema.safeParse("hello").success).toBe(false);
});

test("enum schema validates allowed values", () => {
  const schema = udidi.enum(["red", "green", "blue"]);
  expect(schema.safeParse("red").success).toBe(true);
  expect(schema.safeParse("yellow").success).toBe(false);
});

test("set schema validates members", () => {
  const schema = udidi.set(udidi.number()).hasLength(2);
  expect(schema.safeParse(new Set([1, 2])).success).toBe(true);
  expect(schema.safeParse(new Set([1, 2, 3])).success).toBe(false);
});

test("map schema validates key and value", () => {
  const schema = udidi.map(udidi.string(), udidi.number());
  const good = new Map<string, number>([["a", 1]]);
  const bad = new Map<any, any>([[1, "b"]]);
  expect(schema.safeParse(good).success).toBe(true);
  expect(schema.safeParse(bad).success).toBe(false);
});

test("email validation with default settings", () => {
  const schema = udidi.string().email();
  expect(schema.safeParse("user@example.com").success).toBe(true);
  expect(schema.safeParse("not-an-email").success).toBe(false);
});

test("email validation with domain option", () => {
  const schema = udidi.string().email({ domain: "example.com" });
  expect(schema.safeParse("foo@example.com").success).toBe(true);
  expect(schema.safeParse("foo@test.com").success).toBe(false);
});

test("url validation with default settings", () => {
  const schema = udidi.string().url();
  expect(schema.safeParse("https://example.com").success).toBe(true);
  expect(schema.safeParse("not a url").success).toBe(false);
});

test("url validation with hostname option", () => {
  const schema = udidi.string().url({ hostname: "example.com" });
  expect(schema.safeParse("https://example.com/path").success).toBe(true);
  expect(schema.safeParse("https://other.com").success).toBe(false);
});

test("uuid validation with version", () => {
  const schema = udidi.string().uuid({ version: "v4" });
  expect(schema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(
    true,
  );
  expect(schema.safeParse("550e8400-e29b-11d4-a716-446655440000").success).toBe(
    false,
  );
});

test("ISO date validation", () => {
  const schema = udidi.string().iso.date();
  expect(schema.safeParse("2023-10-05").success).toBe(true);
  expect(schema.safeParse("05/10/2023").success).toBe(false);
});

test("The string schema may validate emojis", () => {
  const emojis: string[] = [
    "😀", // Grinning Face
    "😂", // Face with Tears of Joy
    "😍", // Smiling Face with Heart-Eyes
    "🥺", // Pleading Face
    "🔥", // Fire
    "💯", // Hundred Points
    "🎉", // Party Popper
    "🚀", // Rocket
    "🌟", // Glowing Star
    "🍕", // Pizza
    "🐶", // Dog Face
    "🌍", // Globe Showing Europe-Africa
    "🧠", // Brain
    "🎨", // Artist Palette
    "🎧", // Headphone
  ];
  const schema = udidi.array(udidi.string().emoji());
  expect(schema.safeParse(emojis).success).toBe(true);
  expect(schema.safeParse([...emojis, "Not emoji"]).success).toBe(false);
});

test("IPv6 validation covers compressed notation", () => {
  const schema = udidi.string().ipv6();
  expect(schema.safeParse("2001:db8::1").success).toBe(true);
  expect(schema.safeParse("2001::85a3::8a2e:370:7334").success).toBe(false);
});

test("CIDRv6 validation checks prefix range", () => {
  const schema = udidi.string().cidrv6();
  expect(schema.safeParse("2001:db8::/32").success).toBe(true);
  expect(schema.safeParse("2001:db8::/129").success).toBe(false);
});

test("ISO time validation accepts fractional seconds and offsets", () => {
  const schema = udidi.string().iso.time();
  expect(schema.safeParse("23:59:59.123Z").success).toBe(true);
  expect(schema.safeParse("24:00:00").success).toBe(false);
});

test("ISO duration validation supports weeks", () => {
  const schema = udidi.string().iso.duration();
  expect(schema.safeParse("P1W").success).toBe(true);
  expect(schema.safeParse("P").success).toBe(false);
});

test("trim validation", () => {
  const schema = udidi.string().trim();
  expect(schema.safeParse("hello").success).toBe(true);
  expect(schema.safeParse(" hello ").success).toBe(false);
});

test("toLowerCase validation", () => {
  const schema = udidi.string().toLowerCase();
  expect(schema.safeParse("lowercase").success).toBe(true);
  expect(schema.safeParse("LowerCase").success).toBe(false);
});

test("toUpperCase validation", () => {
  const schema = udidi.string().toUpperCase();
  expect(schema.safeParse("UPPER").success).toBe(true);
  expect(schema.safeParse("Upper").success).toBe(false);
});

test("emoji validation", () => {
  const schema = udidi.string().emoji();
  expect(schema.safeParse("🚀").success).toBe(true);
  expect(schema.safeParse("notEmoji").success).toBe(false);
});

test("base64 validation", () => {
  const schema = udidi.string().base64();
  expect(schema.safeParse("SGVsbG8=").success).toBe(true);
  expect(schema.safeParse("not-base64").success).toBe(false);
});

test("base64url validation", () => {
  const schema = udidi.string().base64url();
  expect(schema.safeParse("dGVzdA==").success).toBe(true);
  expect(schema.safeParse("not_base64url").success).toBe(false);
});

test("nanoid validation", () => {
  const schema = udidi.string().nanoid();
  expect(schema.safeParse("V1StGXR8_Z5jdHi6B-myT").success).toBe(true);
  expect(schema.safeParse("shortid").success).toBe(false);
});

test("cuid validation", () => {
  const schema = udidi.string().cuid();
  expect(schema.safeParse("ck8rzkqdw0004u7de78tdhsz7").success).toBe(true);
  expect(schema.safeParse("c123").success).toBe(false);
});

test("cuid2 validation", () => {
  const schema = udidi.string().cuid2();
  expect(schema.safeParse("dyt8iybwv2uwuv2joizjgybz").success).toBe(true);
  expect(schema.safeParse("invalid-cuid2").success).toBe(false);
});

test("ulid validation", () => {
  const schema = udidi.string().ulid();
  expect(schema.safeParse("01ARZ3NDEKTSV4RRFFQ69G5FAV").success).toBe(true);
  expect(schema.safeParse("01ARZ3NDEKTSV4RRFFQ69G5FA").success).toBe(false);
});

test("ipv4 validation", () => {
  const schema = udidi.string().ipv4();
  expect(schema.safeParse("192.168.0.1").success).toBe(true);
  expect(schema.safeParse("999.999.999.999").success).toBe(false);
});

test("ipv6 validation", () => {
  const schema = udidi.string().ipv6();
  expect(
    schema.safeParse("2001:0db8:85a3:0000:0000:8a2e:0370:7334").success,
  ).toBe(true);
  expect(schema.safeParse("2001:db8::85a3::8a2e:370:7334").success).toBe(false);
});

test("cidrv4 validation", () => {
  const schema = udidi.string().cidrv4();
  expect(schema.safeParse("192.168.0.1/24").success).toBe(true);
  expect(schema.safeParse("192.168.0.1/33").success).toBe(false);
});

test("cidrv6 validation", () => {
  const schema = udidi.string().cidrv6();
  expect(
    schema.safeParse("2001:0db8:85a3:0000:0000:8a2e:0370:7334/64").success,
  ).toBe(true);
  expect(schema.safeParse("2001:db8::85a3::8a2e:370:7334/129").success).toBe(
    false,
  );
});

test("ISO time validation", () => {
  const schema = udidi.string().iso.time();
  expect(schema.safeParse("23:59:59Z").success).toBe(true);
  expect(schema.safeParse("23:59").success).toBe(false);
});

test("ISO datetime validation", () => {
  const schema = udidi.string().iso.datetime();
  expect(schema.safeParse("2023-10-05T14:48:00Z").success).toBe(true);
  expect(schema.safeParse("2023-10-05 14:48:00").success).toBe(false);
});

test("ISO duration validation", () => {
  const schema = udidi.string().iso.duration();
  expect(schema.safeParse("P3Y6M4DT12H30M5S").success).toBe(true);
  expect(schema.safeParse("3Y6M4DT12H30M5S").success).toBe(false);
});
