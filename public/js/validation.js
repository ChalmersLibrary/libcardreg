function validatePersonnummer(input) {
  if (input === null || input === undefined || input === "") return false;

  const temp = input.replace("-", "").trim();
  const personnummer = temp.length === 12 ? temp.substring(2) : temp;
  const isValid = /^\d+$/.test(personnummer) && personnummer.length === 10;

  if (!isValid) return false;

  let sum = 0;
  for (let i = 0; i < personnummer.length; i++) {
      if (i % 2 === 0) {
          const digit =  parseInt(personnummer[i]) * 2;
          sum += digit > 9 ? (digit - 9) : digit;    
      } else {
          sum += parseInt(personnummer[i]);       
      }
  }

  return sum % 10 === 0;
}

function isEqualToPersonnummer(pin) {
  const personnummer = document.getElementById("personnummer").value;
  return personnummer.indexOf(pin) > -1;
}

function isSixDigitPinCode(value) {
  const sixDigitPinCode = 6;
  return /^\d+$/.test(value) && value.length === sixDigitPinCode;
}

function isValidPinCode(pin) {
  if (pin === null || pin === undefined || pin === "") return false;
  if (isEqualToPersonnummer(pin)) return false;
  if (isSixDigitPinCode(pin)) return true;
}

function isEqualPinCodeOne(pinTwo) {
  const pinOne = document.getElementById("pinCode").value;
  return pinOne === pinTwo;
}

function isValidName(value) {
  if (value === null || value === undefined || value === "" || value.length < 2) return false;
  if (value.length >= 2) return true;
}

function validateEmail(value) {
  if (value === null || value === undefined || value === "") return false;
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
}

function setBorderColor(isValid, element) {
  const color = isValid ? "#f8f8f8" : "red";
  element.style.borderColor = color;
}

function showErrorMessage(isValid, elementId) {
  document.getElementById(elementId).style.display = isValid ? "none" : "block";
}

function isValidPersonnummer() {
  const personnummerElement = document.getElementById("personnummer");
  const isValid = validatePersonnummer(personnummerElement.value);
  setBorderColor(isValid, personnummerElement);
  showErrorMessage(isValid, "personnummerError");
  return isValid;
}

function isValidFirstName() {
  const firstNameElement = document.getElementById("firstName");
  const isValid = isValidName(firstNameElement.value);  
  setBorderColor(isValid, firstNameElement);
  showErrorMessage(isValid, "firstNameError");
  return isValid;
}

function isValidLastName() {
  const lastNameElement = document.getElementById("lastName");
  const isValid = isValidName(lastNameElement.value);
  setBorderColor(isValid, lastNameElement);
  showErrorMessage(isValid, "lastNameError");
  return isValid;
}

function isValidEmail() {
  const emailElement = document.getElementById("email");
  const isValid = validateEmail(emailElement.value);
  setBorderColor(isValid, emailElement);
  showErrorMessage(isValid, "emailError");
  return isValid;
}

function isValidPinCodeOne() {
  const pinOneElement = document.getElementById("pinCode");
  const isValid = isValidPinCode(pinOneElement.value);
  setBorderColor(isValid, pinOneElement);
  showErrorMessage(isValid, "pinOneError");
  return isValid;
}

function isValidRepeatPinCode() {
  const pinTwoElement = document.getElementById("repeatPinCode");
  const isValid = isValidPinCode(pinTwoElement.value) && isEqualPinCodeOne(pinTwoElement.value);
  setBorderColor(isValid, pinTwoElement);
  showErrorMessage(isValid, "pinTwoError");
  return isValid;
}

function validateRegForm() {
  const validPersonnummer = isValidPersonnummer();
  const validFirstName = isValidFirstName();
  const validLastName = isValidLastName();
  const validEmail = isValidEmail();
  const validPinOne = isValidPinCodeOne();
  const validRepeatPin = isValidRepeatPinCode();
  const isTermsChecked = document.getElementById("terms").checked;

  return validPersonnummer && validFirstName && validLastName && validEmail && validPinOne && validRepeatPin && isTermsChecked;
}

function validateChalmersForm() {
  const validEmail = isValidEmail();
  const validPinOne = isValidPinCodeOne();
  const validRepeatPin = isValidRepeatPinCode();
  const isTermsChecked = document.getElementById("terms").checked;

  return validEmail && validPinOne && validRepeatPin && isTermsChecked;
}

function validatePinReset() {
  const validPinOne = isValidPinCodeOne();
  const validRepeatPin = isValidRepeatPinCode();

  return validPinOne && validRepeatPin;
}