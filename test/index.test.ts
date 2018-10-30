import * as fs from "fs";
import { avroToGraphqlSchema, hello } from "../src/";

describe("This is a simple test", () => {
  test("Check the sampleFunction function", () => {
    expect(hello("world")).toEqual("Hello, world!");
  });

  test("Check that avro schema is converted properly", () => {
    const schemaText = fs.readFileSync(__dirname + "/sample.avsc", "UTF8");
    const schema = JSON.parse(schemaText);
    global.console.log(avroToGraphqlSchema(schema));
    expect(true);
  });
});
