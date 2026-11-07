
import { ALU8Bit } from "./alu.js";

const alu = new ALU8Bit();

const tests = [
  ["ADD", 10, 20],
  ["SUB", 20, 10],
  ["AND", 12, 10],
  ["OR", 12, 10],
  ["XOR", 12, 10],
  ["NOT", 12]
];

for (const [operation, a, b] of tests) {
  const result = alu.execute(operation, a, b);

  console.log({
    operation,
    a,
    b,
    result: result.result,
    binary: result.result.toString(2).padStart(8, "0"),
    flags: result.flags
  });
}
