"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isRecordType(type) {
    return type.type === "record";
}
exports.isRecordType = isRecordType;
function isArrayType(type) {
    return type.type === "array";
}
exports.isArrayType = isArrayType;
function isMapType(type) {
    return type.type === "map";
}
exports.isMapType = isMapType;
function isEnumType(type) {
    return type.type === "enum";
}
exports.isEnumType = isEnumType;
function isUnion(type) {
    return Array.isArray(type);
}
exports.isUnion = isUnion;
function isOptional(type) {
    return isUnion(type) && type.some(function (t) { return (typeof t === "string" && t === "null"); });
}
exports.isOptional = isOptional;
//# sourceMappingURL=avro.js.map