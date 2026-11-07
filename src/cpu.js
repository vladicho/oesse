
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

    this.flags = {
      zero: false,
      carry: false,
      negative: false
    };

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

  updateFlags(result, carry = false) {
    const value = result & 255;

    this.flags.zero = value === 0;
    this.flags.carry = carry;
    this.flags.negative = (value & 128) !== 0;
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

    switch (op) {
      case "LOAD": {
        const [register, value] = args;
        this.setRegister(register, value);
        this.updateFlags(value);
        break;
      }

      case "ADD": {
        const [dest, a, b] = args;
        const result = this.registers[a] + this.registers[b];

        this.registers[dest] = result & 255;
        this.updateFlags(result, result > 255);
        break;
      }

      case "SUB": {
        const [dest, a, b] = args;
        const result = this.registers[a] - this.registers[b];

        this.registers[dest] = result & 255;
        this.updateFlags(result, result >= 0);
        break;
      }

      case "STORE": {
        const [address, register] = args;
        this.checkAddress(address);
        this.memory[address] = this.registers[register];
        break;
      }

      case "LOADM": {
        const [register, address] = args;
        this.checkAddress(address);
        this.registers[register] = this.memory[address];
        this.updateFlags(this.registers[register]);
        break;
      }

      case "PRINT": {
        const [register] = args;
        this.output.push(this.registers[register]);
        break;
      }

      case "JMP": {
        this.PC = args[0];
        break;
      }

      case "JZ": {
        const [register, address] = args;

        if (this.registers[register] === 0) {
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

  checkAddress(address) {
    if (!Number.isInteger(address) || address < 0 || address > 255) {
      throw new Error(`Endereço de memória inválido: ${address}`);
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
