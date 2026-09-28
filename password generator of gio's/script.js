// Character sets
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// DOM Elements
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const copiedToast = document.getElementById('copiedToast');
const lengthSlider = document.getElementById('lengthSlider');
const lengthVal = document.getElementById('lengthVal');
const includeUpper = document.getElementById('includeUpper');
const includeLower = document.getElementById('includeLower');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const generateBtn = document.getElementById('generateBtn');
const meterFill = document.getElementById('meterFill');
const strengthText = document.getElementById('strengthText');

// Update length slider UI badge
lengthSlider.addEventListener('input', (e) => {
  lengthVal.textContent = e.target.value;
  generatePassword();
});

// Generate password using window.crypto for cryptographically strong randomness
function generatePassword() {
  const length = parseInt(lengthSlider.value);
  let availableChars = '';
  let requiredChars = [];

  if (includeUpper.checked) {
    availableChars += CHAR_SETS.uppercase;
    requiredChars.push(getRandomChar(CHAR_SETS.uppercase));
  }
  if (includeLower.checked) {
    availableChars += CHAR_SETS.lowercase;
    requiredChars.push(getRandomChar(CHAR_SETS.lowercase));
  }
  if (includeNumbers.checked) {
    availableChars += CHAR_SETS.numbers;
    requiredChars.push(getRandomChar(CHAR_SETS.numbers));
  }
  if (includeSymbols.checked) {
    availableChars += CHAR_SETS.symbols;
    requiredChars.push(getRandomChar(CHAR_SETS.symbols));
  }

  // Fallback if no option selected
  if (availableChars === '') {
    passwordOutput.value = '';
    updateStrength(0);
    return;
  }

  let result = [...requiredChars];
  const remainingLength = length - requiredChars.length;

  for (let i = 0; i < remainingLength; i++) {
    result.push(getRandomChar(availableChars));
  }

  // Shuffle array using Fisher-Yates
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(getCryptoRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  passwordOutput.value = result.join('');
  
  // Animation trigger
  passwordOutput.classList.remove('animate-pop');
  void passwordOutput.offsetWidth; // Force reflow
  passwordOutput.classList.add('animate-pop');

  evaluateStrength(result.length);
}

// Helpers for Crypto Randomness
function getCryptoRandom() {
  const cryptoArray = new Uint32Array(1);
  window.crypto.getRandomValues(cryptoArray);
  return cryptoArray[0] / (0xffffffff + 1);
}

function getRandomChar(str) {
  const randomIndex = Math.floor(getCryptoRandom() * str.length);
  return str.charAt(randomIndex);
}

// Calculate Strength
function evaluateStrength(length) {
  let selectedTypes = 0;
  if (includeUpper.checked) selectedTypes++;
  if (includeLower.checked) selectedTypes++;
  if (includeNumbers.checked) selectedTypes++;
  if (includeSymbols.checked) selectedTypes++;

  if (length < 8 || selectedTypes === 1) {
    updateStrength(25, '#ff5252', 'Weak');
  } else if (length < 12 || selectedTypes === 2) {
    updateStrength(55, '#ffb142', 'Medium');
  } else if (length < 16 || selectedTypes === 3) {
    updateStrength(80, '#2ed573', 'Strong');
  } else {
    updateStrength(100, '#00f2fe', 'Very Strong');
  }
}

function updateStrength(percentage, color, label) {
  meterFill.style.width = percentage + '%';
  meterFill.style.backgroundColor = color;
  strengthText.textContent = label;
  strengthText.style.color = color;
}

// Copy to Clipboard
copyBtn.addEventListener('click', () => {
  if (!passwordOutput.value) return;

  navigator.clipboard.writeText(passwordOutput.value).then(() => {
    copiedToast.classList.add('show');
    setTimeout(() => {
      copiedToast.classList.remove('show');
    }, 2000);
  });
});

// Event Listeners for checkboxes
[includeUpper, includeLower, includeNumbers, includeSymbols].forEach(checkbox => {
  checkbox.addEventListener('change', generatePassword);
});

generateBtn.addEventListener('click', generatePassword);

// Initialize on page load
generatePassword();