const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

// Male and female unique names
const maleFirstNames = [
  "James", "Michael", "Robert", "John", "David", "William", "Richard", "Joseph", "Thomas", "Charles",
  "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Kenneth", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan",
  "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon",
  "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry",
  "Tyler", "Aaron", "Jose", "Adam", "Henry", "Nathan", "Douglas", "Zachary", "Peter", "Kyle",
  "Walter", "Ethan", "Jeremy", "Harold", "Keith", "Christian", "Roger", "Noah", "Gerald", "Carl",
  "Terry", "Sean", "Austin", "Arthur", "Lawrence"
]; // 75 names

const femaleFirstNames = [
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
  "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
  "Dorothy", "Carol", "Amanda", "Melissa", "Deborah"
]; // 25 names

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
  "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper",
  "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
  "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
  "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"
]; // 100 names

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

shuffle(maleFirstNames);
shuffle(femaleFirstNames);
shuffle(lastNames);

let generatedAuthors = [];

// 20% age 25-30, 60% age 31-45, 20% age 46-60
const ageGroups = [];
for(let i=0; i<20; i++) ageGroups.push({ age: Math.floor(Math.random() * 6) + 25, exp: Math.floor(Math.random() * 5) + 2 });
for(let i=0; i<60; i++) ageGroups.push({ age: Math.floor(Math.random() * 15) + 31, exp: Math.floor(Math.random() * 14) + 8 });
for(let i=0; i<20; i++) ageGroups.push({ age: Math.floor(Math.random() * 15) + 46, exp: Math.floor(Math.random() * 12) + 23 });
shuffle(ageGroups);

let maleIndex = 0;
let femaleIndex = 0;
let lastNameIndex = 0;

const results = [];

files.forEach((file, index) => {
  const content = fs.readFileSync(path.join(authorsDir, file), 'utf-8');
  
  // Extract category/profession
  let profession = "Unknown";
  const profMatch = content.match(/focused on (.*?)\./);
  if (profMatch) profession = profMatch[1];
  
  // Extract city/country
  let location = "Unknown";
  const locMatch = content.match(/journey in (.*?),/);
  if (locMatch) location = locMatch[1];
  
  // Determine Gender (75 male, 25 female)
  let gender = index < 75 ? "Male" : "Female";
  let firstName = gender === "Male" ? maleFirstNames[maleIndex++] : femaleFirstNames[femaleIndex++];
  let lastName = lastNames[lastNameIndex++];
  
  let newName = `${firstName} ${lastName}`;
  let slug = newName.toLowerCase().replace(/ /g, '-');
  
  const ageData = ageGroups[index];
  
  results.push({
    originalFile: file,
    newName: newName,
    gender: gender,
    age: ageData.age,
    experience: ageData.exp,
    profession: profession,
    location: location,
    slug: slug
  });
});

let mdTable = "# Author Preview\n\n| Original File | New Name | Gender | Age (Exp) | Profession | Location |\n";
mdTable += "|---|---|---|---|---|---|\n";

results.forEach(r => {
  mdTable += `| ${r.originalFile} | **${r.newName}** | ${r.gender} | ${r.age} (${r.experience} yrs) | ${r.profession} | ${r.location} |\n`;
});

// Write artifact
const artifactDir = 'C:\\Users\\MCKR-Asus\\.gemini\\antigravity\\brain\\1bd5908d-9e8a-4fd5-8480-789120cc0e78';
fs.writeFileSync(path.join(artifactDir, 'author_list_preview.md'), mdTable);
fs.writeFileSync(path.join(__dirname, 'author_data.json'), JSON.stringify(results, null, 2));

console.log("Generated author_list_preview.md in artifacts and author_data.json locally");
