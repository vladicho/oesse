
export class ALU8Bit {
  constructor() {
    this.flags = {
      zero: false,
      carry: false,
      negative: false
    };
  }

  updateFlags(result, carry = false) {
    const value = result & 255;

    this.flags.zero = value === 0;
    this.flags.carry = carry;
    this.flags.negative = (value & 128) !== 0;

    return value;
  }

  execute(operation, a, b = 0) {
    let result;
    let carry = false;

    switch (operation) {
      case "ADD":
        result = a + b;
        carry = result > 255;
        break;

      case "SUB":
      case "CMP":
        result = a - b;
        carry = result >= 0;
        break;

      case "AND":
        result = a & b;
        break;

      case "OR":
        result = a | b;
        break;

      case "XOR":
        result = a ^ b;
        break;

      case "NOT":
        result = (~a) & 255;
        break;

      default:
        throw new Error(`Operação inválida: ${operation}`);
    }

    const value = this.updateFlags(result, carry);

    return {
      result: value,
      flags: { ...this.flags },
      operation
    };
  }
}
