// PromptPay EMVCo QR Code Payload Generator according to Bank of Thailand specifications

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean target (digits only)
  const cleanTarget = target.replace(/[^0-9]/g, '');

  let targetType = '01'; // 01 for mobile, 02 for national/tax ID
  let formattedTarget = cleanTarget;

  if (cleanTarget.length === 10 && cleanTarget.startsWith('0')) {
    // Thai Mobile phone: 0812345678 -> 0066812345678
    formattedTarget = '0066' + cleanTarget.substring(1);
    targetType = '01';
  } else if (cleanTarget.length === 13) {
    // National ID or Tax ID
    formattedTarget = cleanTarget;
    targetType = '02';
  } else {
    // Default fallback to 0066 prefix if shorter/mobile
    formattedTarget = '0066' + cleanTarget.replace(/^0/, '');
    targetType = '01';
  }

  // Tag 29: Merchant Info for PromptPay
  const tag29_aid = formatField('00', 'A000000677010111');
  const tag29_target = formatField(targetType, formattedTarget);
  const tag29 = formatField('29', tag29_aid + tag29_target);

  // Tag 00: Version
  const tag00 = formatField('00', '01');

  // Tag 01: 11 for static, 12 for dynamic
  const isDynamic = typeof amount === 'number' && amount > 0;
  const tag01 = formatField('01', isDynamic ? '12' : '11');

  // Tag 53: Currency THB
  const tag53 = formatField('53', '764');

  // Tag 54: Amount
  let tag54 = '';
  if (isDynamic) {
    tag54 = formatField('54', amount.toFixed(2));
  }

  // Tag 58: Country Code
  const tag58 = formatField('58', 'TH');

  // Tag 63: CRC placeholder
  const rawData = tag00 + tag01 + tag29 + tag53 + tag54 + tag58 + '6304';
  const checksum = crc16(rawData);

  return rawData + checksum;
}
