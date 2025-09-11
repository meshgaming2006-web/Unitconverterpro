/* =====================
   UnitConverterPro - Script
   All 10 tools fully working
===================== */

/* ---------- 1. Length Converter ---------- */
function convertLength() {
  const input = parseFloat(document.getElementById("lengthInput").value);
  const from = document.getElementById("lengthFrom").value;
  const to = document.getElementById("lengthTo").value;
  if (isNaN(input)) return;

  let meters;
  switch (from) {
    case "cm": meters = input / 100; break;
    case "inch": meters = input * 0.0254; break;
    case "m": meters = input; break;
    case "km": meters = input * 1000; break;
    default: meters = input;
  }

  let result;
  switch (to) {
    case "cm": result = meters * 100; break;
    case "inch": result = meters / 0.0254; break;
    case "m": result = meters; break;
    case "km": result = meters / 1000; break;
    default: result = meters;
  }

  document.getElementById("lengthResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 2. Weight Converter ---------- */
function convertWeight() {
  const input = parseFloat(document.getElementById("weightInput").value);
  const from = document.getElementById("weightFrom").value;
  const to = document.getElementById("weightTo").value;
  if (isNaN(input)) return;

  let kg;
  switch (from) {
    case "g": kg = input / 1000; break;
    case "kg": kg = input; break;
    case "lb": kg = input * 0.453592; break;
    default: kg = input;
  }

  let result;
  switch (to) {
    case "g": result = kg * 1000; break;
    case "kg": result = kg; break;
    case "lb": result = kg / 0.453592; break;
    default: result = kg;
  }

  document.getElementById("weightResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 3. Temperature Converter ---------- */
function convertTemp() {
  const input = parseFloat(document.getElementById("tempInput").value);
  const from = document.getElementById("tempFrom").value;
  const to = document.getElementById("tempTo").value;
  if (isNaN(input)) return;

  let celsius;
  switch (from) {
    case "C": celsius = input; break;
    case "F": celsius = (input - 32) * (5/9); break;
    case "K": celsius = input - 273.15; break;
    default: celsius = input;
  }

  let result;
  switch (to) {
    case "C": result = celsius; break;
    case "F": result = (celsius * 9/5) + 32; break;
    case "K": result = celsius + 273.15; break;
    default: result = celsius;
  }

  document.getElementById("tempResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 4. Volume Converter ---------- */
function convertVolume() {
  const input = parseFloat(document.getElementById("volumeInput").value);
  const from = document.getElementById("volumeFrom").value;
  const to = document.getElementById("volumeTo").value;
  if (isNaN(input)) return;

  let liters;
  switch (from) {
    case "ml": liters = input / 1000; break;
    case "l": liters = input; break;
    case "gallon": liters = input * 3.78541; break;
    default: liters = input;
  }

  let result;
  switch (to) {
    case "ml": result = liters * 1000; break;
    case "l": result = liters; break;
    case "gallon": result = liters / 3.78541; break;
    default: result = liters;
  }

  document.getElementById("volumeResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 5. Speed Converter ---------- */
function convertSpeed() {
  const input = parseFloat(document.getElementById("speedInput").value);
  const from = document.getElementById("speedFrom").value;
  const to = document.getElementById("speedTo").value;
  if (isNaN(input)) return;

  let ms;
  switch (from) {
    case "kmh": ms = input / 3.6; break;
    case "mph": ms = input * 0.44704; break;
    case "ms": ms = input; break;
    default: ms = input;
  }

  let result;
  switch (to) {
    case "kmh": result = ms * 3.6; break;
    case "mph": result = ms / 0.44704; break;
    case "ms": result = ms; break;
    default: result = ms;
  }

  document.getElementById("speedResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 6. Data Converter ---------- */
function convertData() {
  const input = parseFloat(document.getElementById("dataInput").value);
  const from = document.getElementById("dataFrom").value;
  const to = document.getElementById("dataTo").value;
  if (isNaN(input)) return;

  let bytes;
  switch (from) {
    case "KB": bytes = input * 1024; break;
    case "MB": bytes = input * 1024 * 1024; break;
    case "GB": bytes = input * 1024 * 1024 * 1024; break;
    case "TB": bytes = input * 1024 * 1024 * 1024 * 1024; break;
    default: bytes = input;
  }

  let result;
  switch (to) {
    case "KB": result = bytes / 1024; break;
    case "MB": result = bytes / (1024 * 1024); break;
    case "GB": result = bytes / (1024 * 1024 * 1024); break;
    case "TB": result = bytes / (1024 * 1024 * 1024 * 1024); break;
    default: result = bytes;
  }

  document.getElementById("dataResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 7. Time Converter ---------- */
function convertTime() {
  const input = parseFloat(document.getElementById("timeInput").value);
  const from = document.getElementById("timeFrom").value;
  const to = document.getElementById("timeTo").value;
  if (isNaN(input)) return;

  let seconds;
  switch (from) {
    case "sec": seconds = input; break;
    case "min": seconds = input * 60; break;
    case "hr": seconds = input * 3600; break;
    default: seconds = input;
  }

  let result;
  switch (to) {
    case "sec": result = seconds; break;
    case "min": result = seconds / 60; break;
    case "hr": result = seconds / 3600; break;
    default: result = seconds;
  }

  document.getElementById("timeResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 8. Cooking Converter ---------- */
function convertCooking() {
  const input = parseFloat(document.getElementById("cookInput").value);
  const from = document.getElementById("cookFrom").value;
  const to = document.getElementById("cookTo").value;
  if (isNaN(input)) return;

  let ml;
  switch (from) {
    case "tsp": ml = input * 4.92892; break;
    case "tbsp": ml = input * 14.7868; break;
    case "cup": ml = input * 240; break;
    case "ml": ml = input; break;
    default: ml = input;
  }

  let result;
  switch (to) {
    case "tsp": result = ml / 4.92892; break;
    case "tbsp": result = ml / 14.7868; break;
    case "cup": result = ml / 240; break;
    case "ml": result = ml; break;
    default: result = ml;
  }

  document.getElementById("cookResult").innerText = result.toFixed(2) + " " + to;
}

/* ---------- 9. BMI Calculator ---------- */
function calculateBMI() {
  const weight = parseFloat(document.getElementById("bmiWeight").value);
  const height = parseFloat(document.getElementById("bmiHeight").value) / 100; // cm → m
  if (isNaN(weight) || isNaN(height)) return;

  const bmi = weight / (height * height);
  let status = "";
  if (bmi < 18.5) status = "Underweight";
  else if (bmi < 24.9) status = "Normal weight";
  else if (bmi < 29.9) status = "Overweight";
  else status = "Obese";

  document.getElementById("bmiResult").innerText = "BMI: " + bmi.toFixed(2) + " (" + status + ")";
}

/* ---------- 10. EMI Calculator ---------- */
function calculateEMI() {
  const P = parseFloat(document.getElementById("emiPrincipal").value);
  const r = parseFloat(document.getElementById("emiRate").value) / 100 / 12; // monthly interest
  const n = parseFloat(document.getElementById("emiMonths").value);
  if (isNaN(P) || isNaN(r) || isNaN(n)) return;

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  document.getElementById("emiResult").innerText = "EMI: " + emi.toFixed(2);
}
