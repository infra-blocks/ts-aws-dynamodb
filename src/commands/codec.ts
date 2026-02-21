export type Codec<
  I extends object,
  O extends object,
  DCI extends object,
  DCO extends object,
> = {
  encode(input: I): DCI;
  decode(output: DCO): O;
};
