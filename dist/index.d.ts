import { RecordType } from "./avro";
export declare function hello(word: string): string;
/** Converts an Avro record type to a TypeScript file */
export declare function avroToGraphqlSchema(recordType: RecordType): string;
