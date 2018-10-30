import { isOptional, isUnion } from "../src/avro";

const unionFixture = {
  name: "unionRecord",
  type: ["null", "string"],
};

const doubleFixture = { name: "adouble" , default: null,  type: [ "null", "double" ] };

describe("Testing the avro schema decoder helper functions", () => {
  test("isUnion", () => {
    const { type } = unionFixture;
    expect(isUnion(type)).toBe(true);
  });

  test("isOptional should be true for union", () => {
    const { type } = unionFixture;
    expect(isOptional(type)).toBe(true);
  });

  test("isOptional should be true for double", () => {
    const { type } = doubleFixture;
    expect(isOptional(type)).toBe(true);
  });
});
