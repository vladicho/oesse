
import { ALU8Bit } from "./alu.js";

export class CPU8Bit {
  constructor() {
    this.registers = {
      R1: 0,
      R2: 0,
      R3: 0,
      R4: 0
    };

    this.memory = new Uint8Array(256);
    this.PC = 0;

    this.alu = new ALU8Bit();
    this.flags = this.alu.flags;

    this.halted = false;
    this.output = [];
  }

  setRegister(name, value) {
    if (!(name in this.registers)) {
      throw new Error(`Registrador inválido: ${name}`);
    }

    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error("Valor deve estar entre 0 e 255.");
    }

    this.registers[name] = value;
  }

  checkAddress(address) {
    if (!Number.isInteger(address) || address < 0 || address > 255) {
      throw new Error(`Endereço inválido: ${address}`);
    }
  }

  checkRegister(name) {
    if (!(name in this.registers)) {
      throw new Error(`Registrador inválido: ${name}`);
    }
  }

  step(program) {
    if (this.halted) return;

    if (this.PC < 0 || this.PC >= program.length) {
      this.halted = true;
      return;
    }

    const instruction = program[this.PC];
    this.PC++;

    const [op, ...args] = instruction;
    let result;

    switch (op) {
      case "LOAD": {
        const [register, value] = args;
        this.setRegister(register, value);
        result = this.alu.execute("ADD", value, 0);
        Object.assign(this.flags, result.flags);
        break;
      }

      case "ADD":
      case "SUB":
      case "AND":
      case "OR":
      case "XOR": {
        const [dest, a, b] = args;

        this.checkRegister(dest);
        this.checkRegister(a);
        this.checkRegister(b);

        result = this.alu.execute(
          op,
          this.registers[a],
          this.registers[b]
        );

        this.setRegister(dest, result.result);
        Object.assign(this.flags, result.flags);
        break;
      }

      case "NOT": {
        const [dest, a] = args;

        this.checkRegister(dest);
        this.checkRegister(a);

        result = this.alu.execute(
          "NOT",
          this.registers[a]
        );

        this.setRegister(dest, result.result);
        Object.assign(this.flags, result.flags);
        break;
      }

      case "CMP": {
        const [a, b] = args;

        this.checkRegister(a);
        this.checkRegister(b);

        result = this.alu.execute(
          "CMP",
          this.registers[a],
          this.registers[b]
        );

        Object.assign(this.flags, result.flags);
        break;
      }

      case "STORE": {
        const [address, register] = args;

        this.checkAddress(address);
        this.checkRegister(register);

        this.memory[address] = this.registers[register];
        break;
      }

      case "LOADM": {
        const [register, address] = args;

        this.checkAddress(address);
        this.checkRegister(register);

        this.setRegister(register, this.memory[address]);

        result = this.alu.execute(
          "ADD",
          this.memory[address],
          0
        );

        Object.assign(this.flags, result.flags);
        break;
      }

      case "PRINT": {
        const [register] = args;

        this.checkRegister(register);
        this.output.push(this.registers[register]);
        break;
      }

      case "JMP": {
        const [address] = args;

        if (!Number.isInteger(address) ||
            address < 0 || address >= program.length) {
          throw new Error("Destino de salto inválido.");
        }

        this.PC = address;
        break;
      }

      case "JZ": {
        const [register, address] = args;

        this.checkRegister(register);

        if (!Number.isInteger(address) ||
            address < 0 || address >= program.length) {
          throw new Error("Destino de salto inválido.");
        }

        if (this.flags.zero) {
          this.PC = address;
        }
        break;
      }

      case "HALT": {
        this.halted = true;
        break;
      }

      default:
        throw new Error(`Instrução desconhecida: ${op}`);
    }
  }

  run(program, maxSteps = 1000) {
    let steps = 0;

    while (!this.halted && steps < maxSteps) {
      this.step(program);
      steps++;
    }

    if (steps >= maxSteps && !this.halted) {
      throw new Error("Limite de execução atingido.");
    }

    return {
      registers: { ...this.registers },
      memory: Array.from(this.memory),
      flags: { ...this.flags },
      output: [...this.output],
      PC: this.PC,
      halted: this.halted
    };
  }
}
