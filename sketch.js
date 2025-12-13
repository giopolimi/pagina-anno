let table;
let years = [];
let currentYearIndex = 0;
let testsByYear = {};
let countries = [];
let mushroomImg;
let countryOrder = ['INDIA', 'PAKISTAN', 'USA', 'URSS', 'FRANCE', 'UK', 'CHINA'];

function preload() {
  table = loadTable('sipri-report-explosions.csv', 'csv', 'header');
  mushroomImg = loadImage('bleauuu.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  processData();
  document.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
}

function draw() {
  background(20);

  if (mushroomImg) {
    push();
    imageMode(CENTER);
    tint(255);
    image(mushroomImg, width / 2, height / 2, width, height);
    pop();
  }
  
  if (years.length === 0) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Caricamento dati...", width / 2, height / 2);
    return;
  }
  
  let currentYear = years[currentYearIndex];
  let yearData = testsByYear[currentYear];
  
  drawTitle();
  drawYearNavigation(currentYear);
  drawTestDots(yearData);
  drawBottomInfo(yearData);
}

function processData() {
  let allTests = [];
  
  for (let i = 0; i < table.getRowCount(); i++) {
    let year = parseInt(table.getString(i, 'year'));
    let country = table.getString(i, 'country');
    let yield_u = parseFloat(table.getString(i, 'yield_u'));
    
    if (!isNaN(year) && year > 0 && country && country.trim() !== '') {
      allTests.push({
        year: year,
        country: country.trim(),
        yield: isNaN(yield_u) || yield_u < 0 ? 0 : yield_u
      });
    }
  }
  
  allTests.forEach(test => {
    if (!testsByYear[test.year]) {
      testsByYear[test.year] = {};
      years.push(test.year);
    }
    if (!testsByYear[test.year][test.country]) {
      testsByYear[test.year][test.country] = [];
      if (!countries.includes(test.country)) countries.push(test.country);
    }
    testsByYear[test.year][test.country].push(test.yield);
  });
  
  years.sort((a, b) => a - b);
  countries.sort();

  countries = countryOrder.filter(c => countries.includes(c));
  let remainingCountries = allTests
    .map(t => t.country)
    .filter(c => !countries.includes(c))
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();
  countries = countries.concat(remainingCountries);
}

function getYieldColor(y) {
  if (isNaN(y) || y === null || y === undefined) y = 0;
  y = parseFloat(y);
  
  if (y >= 0 && y <= 19) return color(218, 191, 255, 255);
  else if (y === 20) return color(207, 131, 255, 255);
  else if (y >= 21 && y <= 150) return color(255, 36, 240, 255);
  else if (y >= 151 && y <= 4999) return color(209, 0, 157, 255);
  else if (y >= 5000) return color(118, 0, 87, 255);
  return color(150, 150, 150, 255);
}

function drawTitle() {
  noStroke();
  textAlign(CENTER, TOP);
  textSize(32);
  fill(255);
  text("Nuclear Text each Year", width / 2, 20);
}

function drawYearNavigation(currentYear) {
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text(currentYear, width / 2, 60);
  
  // Freccia sinistra <
  fill(mouseX > width/2 - 150 && mouseX < width/2 - 90 && mouseY > 40 && mouseY < 80 ? 255 : 150);
  triangle(width/2 - 130, 60, width/2 - 100, 45, width/2 - 100, 75);
  
  // Freccia destra >
  fill(mouseX > width/2 + 90 && mouseX < width/2 + 150 && mouseY > 40 && mouseY < 80 ? 255 : 150);
  triangle(width/2 + 130, 60, width/2 + 100, 45, width/2 + 100, 75);
}

function drawTestDots(yearData) {
  let dotSize = 12;
  let dotsPerRow = 2;
  let columnSpacing = 100;
  let rowSpacing = 18;
  let lineY = height - 250;
  let minY = 100;
  
  let totalCountries = countries.length;
  let startX = width / 2 - (totalCountries * columnSpacing) / 2;
  
  // Calcola e aggiusta dimensioni
  let maxTests = Math.max(...countries.map(c => (yearData[c] || []).length));
  let maxRows = Math.ceil(maxTests / dotsPerRow);
  let availableHeight = lineY - minY - 20;
  
  while (maxRows * rowSpacing > availableHeight && dotSize > 6) {
    dotSize--;
    rowSpacing = dotSize + 6;
  }
  
  // Disegna pallini per ogni paese
  countries.forEach((country, idx) => {
    let tests = yearData[country] || [];
    let x = startX + idx * columnSpacing;
    let countryHeight = Math.ceil(tests.length / dotsPerRow) * rowSpacing;
    let startY = lineY - 20 - countryHeight;
    
    tests.forEach((yieldVal, i) => {
      let col = i % dotsPerRow;
      let row = Math.floor(i / dotsPerRow);
      let safeYield = isNaN(yieldVal) || yieldVal === null ? 0 : parseFloat(yieldVal);
      
      fill(getYieldColor(safeYield));
      noStroke();
      circle(x + col * (dotSize + 8), startY + row * rowSpacing, dotSize);
    });
  });
  
  // Linea separazione e nomi
  stroke(100);
  strokeWeight(2);
  line(50, lineY, width - 50, lineY);
  
  noStroke();
  textAlign(CENTER);
  textSize(14);
  fill(200);
  countries.forEach((country, idx) => {
    text(country, startX + idx * columnSpacing + 4, lineY + 30);
  });
}

function drawBottomInfo(yearData) {
  let total = Object.values(yearData).reduce((sum, tests) => sum + tests.length, 0);
  let boxY = height - 120;
  
  // Box totale
  fill(40);
  noStroke();
  rect(50, boxY, 200, 100, 10);
  fill(255);
  textAlign(LEFT);
  textSize(14);
  text("TOTALE EVENTI", 65, boxY + 30);
  textSize(32);
  text(total, 65, boxY + 65);
  
  // Box legenda
  fill(40);
  rect(width - 280, boxY, 230, 100, 10);
  fill(255);
  textSize(12);
  text("LEGENDA POTENZA", width - 265, boxY + 20);
  
  let legend = [
    { range: "0-19 kt", y: 10 },
    { range: "20 kt", y: 20 },
    { range: "21-150 kt", y: 100 },
    { range: "151-4999 kt", y: 1000 },
    { range: "5000+ kt", y: 5000 }
  ];
  
  textSize(12);
  legend.forEach((item, i) => {
    fill(getYieldColor(item.y));
    circle(width - 260, boxY + 40 + i * 12, 10);
    fill(200);
    text(item.range, width - 245, boxY + 44 + i * 12);
  });
}

function mousePressed() {
  if (mouseX > width/2 - 150 && mouseX < width/2 - 90 && mouseY > 40 && mouseY < 80) {
    if (currentYearIndex > 0) currentYearIndex--;
  }
  if (mouseX > width/2 + 90 && mouseX < width/2 + 150 && mouseY > 40 && mouseY < 80) {
    if (currentYearIndex < years.length - 1) currentYearIndex++;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}