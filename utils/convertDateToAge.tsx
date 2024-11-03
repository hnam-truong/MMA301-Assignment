import { differenceInYears } from "date-fns";

export function calculateAge(birthDate: string): number {
  return differenceInYears(new Date(), new Date(birthDate));
}

// Example usage:
const birthDate = "1990-05-20";
const age = calculateAge(birthDate);
console.log(`Age: ${age}`); // Outputs the age based on the birthDate
