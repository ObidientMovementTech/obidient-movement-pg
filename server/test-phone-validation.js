// Test phone validation
const testPhoneNumber = "8030451514";
const phoneRegex = /^[\+]?[0-9\-\s().]+$/;

console.log("Testing phone number:", testPhoneNumber);
console.log("Length:", testPhoneNumber.length);
console.log("Regex test result:", phoneRegex.test(testPhoneNumber));
console.log("Characters in phone:", testPhoneNumber.split('').map(c => `'${c}' (${c.charCodeAt(0)})`));

// Test with some variations
const testNumbers = [
  "8030451514",
  "+2348030451514",
  "08030451514",
  "803-045-1514",
  "803 045 1514",
  "(803) 045-1514"
];

testNumbers.forEach(num => {
  console.log(`\n"${num}" (${num.length} chars):`, phoneRegex.test(num));
});
