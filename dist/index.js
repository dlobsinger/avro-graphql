"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_random_string_1 = __importDefault(require("crypto-random-string"));
var avro_1 = require("./avro");
function hello(word) {
    return "Hello, " + word + "!";
}
exports.hello = hello;
/** Converts an Avro record type to a TypeScript file */
function avroToGraphqlSchema(recordType) {
    var output = [];
    convertRecord(recordType, output);
    return output.join("\n");
}
exports.avroToGraphqlSchema = avroToGraphqlSchema;
/** Convert an Avro Record type. Return the name, but add the definition to the file */
function convertRecord(recordType, fileBuffer) {
    var buffer = "type " + recordType.name + " {\n";
    for (var _i = 0, _a = recordType.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        // global.console.log(field.name);
        buffer += convertFieldDec(field, fileBuffer) + "\n";
    }
    buffer += "}\n";
    fileBuffer.push(buffer);
    return recordType.name;
}
function filterNullType(arrayType) {
    var filtered = arrayType.filter(function (t) { return !(typeof t === "string" && t === "null"); });
    return filtered.length > 1 ? filtered : filtered[0];
}
function convertFieldDec(field, buffer) {
    // Union Type
    var typeWithoutNulls = avro_1.isUnion(field.type) ? filterNullType(field.type) : field.type;
    return "\t" + field.name + ": " + convertType(typeWithoutNulls, buffer) + (avro_1.isOptional(field.type) ? "" : "!");
}
function convertType(type, buffer, parentIsUnion) {
    if (parentIsUnion === void 0) { parentIsUnion = false; }
    // if it's just a name, then use that
    if (typeof type === "string") {
        return convertPrimitive(type);
    }
    else if (type instanceof Array) {
        // array means a Union. Use the names and call recursively
        global.console.error("Unions are not supported yet. Consider restructuring your data more strictly.", type);
        return generateUnion(type, buffer);
        // return type.map((t) => convertType(t, buffer)).filter(Boolean).join(" | ");
    }
    else if (avro_1.isRecordType(type)) {
        // } type)) {
        // record, use the name and add to the buffer
        return convertRecord(type, buffer);
    }
    else if (avro_1.isArrayType(type)) {
        // array, call recursively for the array element type
        return "[" + convertType(type.items, buffer) + "]";
    }
    else if (avro_1.isMapType(type)) {
        // Dictionary of types, string as key
        global.console.warn("Maps cannot be represented in GraphQL. It will instead be represented as an array of Key-Value types.", type);
        return "" + convertMap(type, buffer, parentIsUnion);
    }
    else if (avro_1.isEnumType(type)) {
        // array, call recursively for the array element type
        return convertEnum(type, buffer);
    }
    else {
        global.console.error("Cannot work out type", type);
        return "UNKNOWN";
    }
}
function convertPrimitive(avroType) {
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
function convertEnum(enumType, fileBuffer) {
    var enumDef = "enum " + enumType.name + " {\n" + enumType.symbols.map(function (s) { return "\t" + s + "\n"; }).join("") + "}\n";
    fileBuffer.push(enumDef);
    return enumType.name;
}
/** Convert an Avro Map type. Return the name, but add the definition to the file */
function convertMap(mapType, fileBuffer, parentIsUnion) {
    if (parentIsUnion === void 0) { parentIsUnion = false; }
    var typeRef = "_" + crypto_random_string_1.default(9);
    var mapDef = "type " + typeRef + " {\n\tkey: String\n\tvalue: " + convertType(mapType.values, fileBuffer) + "\n}\n";
    fileBuffer.push(mapDef);
    return parentIsUnion ? generateArrayAlias(typeRef, fileBuffer) : "[" + typeRef + "]";
}
/** Convert an Avro Union type to a GraphQl Union. For each scalar create a value type alias. */
function generateUnion(unionType, fileBuffer) {
    var typeRef = "_" + crypto_random_string_1.default(9);
    var errorDef = "type " + typeRef + " {\n\terror: String\n}\n";
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
function generateTypeAlias(gqlScalar, fileBuffer) {
    var typeAlias = "_" + gqlScalar + "_";
    var aliasDef = "type " + typeAlias + " {\n\tvalue: " + gqlScalar + "\n}\n";
    fileBuffer.push(aliasDef);
    return typeAlias;
}
function generateArrayAlias(gqlScalar, fileBuffer) {
    var typeAlias = "_" + gqlScalar + "_";
    var aliasDef = "type " + typeAlias + " {\n\tvalues: [" + gqlScalar + "]\n}\n";
    fileBuffer.push(aliasDef);
    return typeAlias;
}
//# sourceMappingURL=index.js.map