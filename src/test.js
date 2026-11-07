
import { CPU8Bit } from "./cpu.js";

const cpu = new CPU8Bit();

const program = [
  ["LOAD", "R1", 10],
  ["LOAD", "R2", 20],
  ["ADD", "R3", "R1", "R2"],
  ["STORE", 100, "R3"],
  ["PRINT", "R3"],
  ["HALT"]
];

const result = cpu.run(program);

console.log("=== OESSE CPU 8-BIT ===");
console.log("Registradores:", result.registers);
console.log("RAM[100]:", result.memory[100]);
console.log("Saída:", result.output);
console.log("Flags:", result.flags);
console.log("CPU parada:", result.halted);
