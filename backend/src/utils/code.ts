import { SubType } from "@prisma/client";

// Starting and ending ranges for every subType.
export const subTypeRanges: Record<SubType, { start: number; end: number }> = {
  civil: { start: 1000, end: 1999 },
  ohe: { start: 2000, end: 2999 },
  pway: { start: 3000, end: 3999 },
  structural_steel: { start: 4000, end: 4999 },
  reinforcement_steel: { start: 5000, end: 5999 },
  roofing_sheets: { start: 6000, end: 6999 },
  flush_doors: { start: 7000, end: 7999 },
  mechanical: { start: 8000, end: 8999 },
};

/**
 * generates a code for parent (normal) item
 * @param subType the subType of the item
 * @param lastCode the last generated code for this subType. ex. (M1001), Pass undefined if first this is the first item
 * @returns the next parent code as string
 */
export function generateParentCode(
  subType: SubType,
  lastCode?: string
): string {
  const range = subTypeRanges[subType];
  if (!range) {
    throw new Error(`Invalid subType provided ${subType}`);
  }

  let newCodeNumber: number;
  if (lastCode) {
    // Remove the 'M' prefix
    const lastNumber = parseInt(lastCode.slice(1));
    newCodeNumber = lastNumber + 1;
  } else {
    // First Item in this subtype: start from the first number in range plus 1
    newCodeNumber = range.start + 1;
  }

  if (newCodeNumber > range.end) {
    throw new Error(
      `can not generate new code for ${subType}. Reached max number in range`
    );
  }

  return `M${newCodeNumber}`;
}

/**
 * generates a code for child item.
 * @param parentCode the code of parent item ex. (M1001)
 * @param lastChildCode the last generated child code for this parent ex. (M1001-03). Pass undefined if this is first child
 * @returns The next child code as string
 */
export function generateChildCode(
  parentCode: string,
  lastChildCode?: string
): string {
  let newChildNumber: number;
  if (lastChildCode) {
    // split the lastChildCode by '-'
    // ex 'M1001-03' after split -> ["M1001", "03"]
    const parts = lastChildCode.split("-");
    if (parts.length !== 2) {
      throw new Error(`Invalid child code format ${lastChildCode}`);
    }
    // parts [0] = M1001
    // parts [1] = 03
    const lastChildNumber = parseInt(parts[1]);
    // ex. 03 + 1 = 4 (according to prev. example)
    newChildNumber = lastChildNumber + 1;
  } else {
    // if there is no lastChildCode then set the last child code to 1
    newChildNumber = 1;
  }

  if (newChildNumber > 99) {
    throw new Error(
      `can not generate a new child code for parent ${parentCode}. Max of 99 child items reached`
    );
  }

  // newChildNumber = 4
  // after .padStart(2, "0") -> 04
  const childNumberStr = newChildNumber.toString().padStart(2, "0");
  // ex. `M1001-04`
  return `${parentCode}-${childNumberStr}`;
}

/**
 * Checks if the given code is a valid parent code for the provided subType.
 * @param subType The SubType to check against.
 * @param code The code string to validate.
 * @returns boolean - true if the code is valid, false otherwise.
 */
export function isValidParentCode(subType: SubType, code: string): boolean {
  const range = subTypeRanges[subType];
  if (!range) {
    return false;
  }

  if (!code.startsWith("M")) {
    return false;
  }

  const codeNumberPart = code.substring(1); // Remove 'M'
  const codeNumber = parseInt(codeNumberPart, 10);

  if (isNaN(codeNumber)) {
    return false;
  }

  if (codeNumber < range.start || codeNumber > range.end) {
    return false;
  }
  // Code is valid
  return true;
}

/**
 * Checks if the given code is a valid code (parent or child) for the provided subType.
 * @param subType The SubType to check against.
 * @param code The code string to validate.
 * @returns boolean - true if the code is valid, false otherwise.
 */
export function isValidCode(subType: SubType, code: string): boolean {
  if (isValidParentCode(subType, code)) {
    return true; // It's a valid parent code
  }

  // split code format (e.g., M1001-01)
  const parts = code.split("-");
  if (parts.length === 2) {
    const parentCodePart = parts[0];
    const childCodePart = parts[1];

    if (!isValidParentCode(subType, parentCodePart)) {
      return false; // parent cod part invalid
    }

    const childNumber = parseInt(childCodePart, 10);
    if (isNaN(childNumber)) {
      return false; // Child code part is not a number
    }

    if (childNumber < 1 || childNumber > 99) {
      return false; // Child code number out of range (1-99)
    }

    if (
      childCodePart.length !== 2 ||
      childNumber.toString().padStart(2, "0") !== childCodePart
    ) {
      return false; // Child code part must be two digits (e.g., "01", "09", "10", ... "99")
    }

    return true; // It's a valid child code
  }

  return false; // not a valid code
}
