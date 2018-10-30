import generateId from "crypto-random-string";
import {
  BaseType,
  EnumType,
  Field,
  isArrayType,
  isEnumType,
  isMapType,
  isOptional,
  isRecordType,
  isUnion,
  MapType,
  NameOrType,
  RecordType,
  Type,
} from "./avro";

export function hello(word: string): string {
  return `Hello, ${word}!`;
}

/** Converts an Avro record type to a TypeScript file */
export function avroToGraphqlSchema(recordType: RecordType): string {
  const output: string[] = [];
  convertRecord(recordType, output);
  return output.join("\n");
}

/** Convert an Avro Record type. Return the name, but add the definition to the file */
function convertRecord(recordType: RecordType, fileBuffer: string[]): string {
  let buffer = `type ${recordType.name} {\n`;
  for (const field of recordType.fields) {
    // global.console.log(field.name);
    buffer += convertFieldDec(field, fileBuffer) + "\n";
  }
  buffer += "}\n";
  fileBuffer.push(buffer);
  return recordType.name;
}

function filterNullType(arrayType: NameOrType[]): Type {
  const filtered = arrayType.filter((t) => !(typeof t === "string" && t === "null"));
  return filtered.length > 1 ? filtered : filtered[0];
}

function convertFieldDec(field: Field, buffer: string[]): string {
  // Union Type
  const typeWithoutNulls = isUnion(field.type) ? filterNullType(field.type) : field.type;
  return `\t${field.name}: ${convertType(typeWithoutNulls, buffer)}${isOptional(field.type) ? "" : "!"}`;
}

function convertType(type: Type, buffer: string[], parentIsUnion: boolean = false): string {
  // if it's just a name, then use that
  if (typeof type === "string") {
    return convertPrimitive(type);
  } else if (type instanceof Array) {
    // array means a Union. Use the names and call recursively
    global.console.error("Unions are not supported yet. Consider restructuring your data more strictly.", type);
    return generateUnion(type, buffer);
    // return type.map((t) => convertType(t, buffer)).filter(Boolean).join(" | ");
  } else if (isRecordType(type)) {
    // } type)) {
    // record, use the name and add to the buffer
    return convertRecord(type, buffer);
  } else if (isArrayType(type)) {
    // array, call recursively for the array element type
    return `[${convertType(type.items, buffer)}]`;
  } else if (isMapType(type)) {
    // Dictionary of types, string as key
    global.console.warn(
      "Maps cannot be represented in GraphQL. It will instead be represented as an array of Key-Value types.", 
      type,
    );
    return `${convertMap(type, buffer, parentIsUnion)}`;
  } else if (isEnumType(type)) {
    // array, call recursively for the array element type
    return convertEnum(type, buffer);
  } else {
    global.console.error("Cannot work out type", type);
    return "UNKNOWN";
  }
}

function convertPrimitive(avroType: string): string {
  switch (avroType) {
    case "bytes":
    case "string":
      return "String";
    case "int":
      return "Int";
    case "long":
    case "float":
    case "double":
      return "Float";
    case "boolean":
      return "Boolean";
    case "null":
      return "";
    default:
      return avroType;
  }
}

/** Convert an Avro Enum type. Return the name, but add the definition to the file */
function convertEnum(enumType: EnumType, fileBuffer: string[]): string {
  const enumDef = `enum ${enumType.name} {\n${enumType.symbols.map((s) => `\t${s}\n`).join("")}}\n`;
  fileBuffer.push(enumDef);
  return enumType.name;
}

/** Convert an Avro Map type. Return the name, but add the definition to the file */
function convertMap(mapType: MapType, fileBuffer: string[], parentIsUnion: boolean = false): string {
  const typeRef = `_${generateId(9)}`;
  const mapDef = `type ${typeRef} {\n\tkey: String\n\tvalue: ${convertType(mapType.values, fileBuffer)}\n}\n`;
  fileBuffer.push(mapDef);
  return parentIsUnion ? generateArrayAlias(typeRef, fileBuffer) : `[${typeRef}]`;
}

/** Convert an Avro Union type to a GraphQl Union. For each scalar create a value type alias. */
function generateUnion(unionType: NameOrType[], fileBuffer: string[]): string {
  const typeRef = `_${generateId(9)}`;
  const errorDef = `type ${typeRef} {\n\terror: String\n}\n`;
  fileBuffer.push(errorDef);
  /* const isGraphQLScalar = (avroType: BaseType | string) => (
    typeof avroType === "string" || isEnumType(avroType)
  );
  const gqlTypes = unionType.map((t: NameOrType) => {
    const converted = convertType(t, fileBuffer, true);
    return isGraphQLScalar(t) ? generateTypeAlias(converted, fileBuffer) : converted;
  });
  const unionDef = `union ${typeRef} = ${gqlTypes.join(" | ")}`;
  fileBuffer.push(unionDef);*/
  return typeRef;
}

function generateTypeAlias(gqlScalar: string, fileBuffer: string[]): string {
  const typeAlias = `_${gqlScalar}_`;
  const aliasDef = `type ${typeAlias} {\n\tvalue: ${gqlScalar}\n}\n`;
  fileBuffer.push(aliasDef);
  return typeAlias;
}

function generateArrayAlias(gqlScalar: string, fileBuffer: string[]): string {
  const typeAlias = `_${gqlScalar}_`;
  const aliasDef = `type ${typeAlias} {\n\tvalues: [${gqlScalar}]\n}\n`;
  fileBuffer.push(aliasDef);
  return typeAlias;
}
