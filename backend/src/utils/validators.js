export function cleanNumber(value) {
  return value.replace(/\D/g, '');
}

export function validateCpf(cpf) {
  cpf = cleanNumber(cpf);
  if (!cpf || cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cpf[10]);
}

export function validateCnpj(cnpj) {
  cnpj = cleanNumber(cnpj);
  if (!cnpj || cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false;
  const calc = (length) => {
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += numbers[length - i] * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits[0]);
  };
  if (!calc(12)) return false;
  return calc(13);
}

export function validateCpfCnpj(value) {
  return validateCpf(value) || validateCnpj(value);
}

export function validatePhone(value) {
  const digits = cleanNumber(value);
  return digits.length >= 10 && digits.length <= 11;
}
