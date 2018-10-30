export type Type = NameOrType | NameOrType[];
export type NameOrType = TypeNames | RecordType | ArrayType | NamedType;
export type TypeNames = "record" | "array" | "null" | "map" | string;

export interface ArrayType extends BaseType {
  type: "array";
  items: Type;
}

export interface BaseType {
  type: TypeNames;
}

export interface EnumType extends BaseType {
  type: "enum";
  name: string;
  symbols: string[];
}

export interface Field {
  name: string;
  type: Type;
  default?: string | number | null | boolean;
}

export interface MapType extends BaseType {
  type: "map";
  values: Type;
}

export interface NamedType extends BaseType {
  type: string;
}

export interface RecordType extends BaseType {
  type: "record";
  name: string;
  fields: Field[];
}

export function isRecordType(type: BaseType): type is RecordType {
  return type.type === "record";
}

export function isArrayType(type: BaseType): type is ArrayType {
  return type.type === "array";
}

export function isMapType(type: BaseType): type is MapType {
  return type.type === "map";
}

export function isEnumType(type: BaseType): type is EnumType {
  return type.type === "enum";
}

export function isUnion(type: Type): type is NamedType[] {
  return Array.isArray(type);
}

export function isOptional(type: Type): boolean {
  return isUnion(type) && type.some( (t) => (
    typeof t === "string" && t === "null"
  ));
}
