const fs = require('fs');
const path = require('path');

const techSpecialties = [
  "Artificial Intelligence & Machine Learning",
  "Cybersecurity & Cryptography",
  "Cloud Computing & DevOps",
  "Web3 & Decentralized Systems",
  "Quantum Computing",
  "Data Science & Big Data Analytics",
  "Software Engineering & Architecture",
  "HealthTech & Biotech",
  "IoT & Smart Cities",
  "AR/VR & Spatial Computing"
];

const financeSpecialties = [
  "Cryptocurrency & Digital Assets",
  "Global Macroeconomics",
  "Real Estate & Property Tech",
  "Investment Banking & VC",
  "Personal Finance & Wealth Management",
  "Algorithmic Trading",
  "FinTech Innovations"
];

const sportsSpecialties = [
  "Football Analytics & Tactics",
  "Basketball & NBA Statistics",
  "Formula 1 & Motorsport Tech",
  "eSports & Competitive Gaming",
  "Sports Biomechanics",
  "Tennis & Racket Sports"
];

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Peyton", "Quinn"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

let totalId = 1;
function genNames(count, category, specialties) {
  const authors = [];
  for(let i=1; i<=count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    authors.push({
      id: totalId++,
      name: `${fn} ${ln}`,
      category: category,
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      country: ["USA", "UK", "Canada", "Germany", "France", "Japan", "South Korea"][Math.floor(Math.random() * 7)]
    });
  }
  return authors;
}

const allAuthors = [
  ...genNames(60, "Technology", techSpecialties),
  ...genNames(20, "Finance", financeSpecialties),
  ...genNames(20, "Sports", sportsSpecialties)
];

const dest = path.join(__dirname, 'authors_list.json');
fs.writeFileSync(dest, JSON.stringify(allAuthors, null, 2));
console.log(`Generated ${allAuthors.length} authors to ${dest}`);
