const fs = require('fs');
const path = require('path');

const authorsDir = path.join(__dirname, 'src', 'content', 'authors');
const imagesDir = path.join(__dirname, 'public', 'images', 'authors');
const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));

// Demographic specific names based on the 24 images
const specificAuthors = [
  { img: "ali-tanaka.webp", name: "Amir Al-Fayed", gender: "Male" },
  { img: "dmitry-hassan.webp", name: "Dmitry Ivanov", gender: "Male" },
  { img: "elena-hassan.webp", name: "Elena Sokolova", gender: "Female" },
  { img: "elena-rodriguez.webp", name: "Isabella Martinez", gender: "Female" },
  { img: "fatou-dubois.webp", name: "Fatou Diop", gender: "Female" },
  { img: "ivan-olsen.webp", name: "Ivan Petrov", gender: "Male" },
  { img: "kenji-olsen.webp", name: "Kenji Nakamura", gender: "Male" },
  { img: "kwame-hassan.webp", name: "Kwame Mensah", gender: "Male" },
  { img: "kwame-schneider.webp", name: "Kofi Addo", gender: "Male" },
  { img: "marcel-johansen.webp", name: "Marcel Bauer", gender: "Male" },
  { img: "mateo-costa.webp", name: "Mateo Silva", gender: "Male" },
  { img: "mia-garcia.webp", name: "Mia Gonzalez", gender: "Female" },
  { img: "nia-osei.webp", name: "Nia Appiah", gender: "Female" },
  { img: "nia-smirnov.webp", name: "Zara Yeboah", gender: "Female" },
  { img: "olivia-li.webp", name: "Olivia Chen", gender: "Female" },
  { img: "sofia-choi.webp", name: "Sofia Kim", gender: "Female" },
  { img: "sven-levy.webp", name: "Sven Johansson", gender: "Male" },
  { img: "tariq-lopez.webp", name: "Tariq Mahmood", gender: "Male" },
  { img: "tariq-ndiaye.webp", name: "Omar Sy", gender: "Male" },
  { img: "tariq-silva.webp", name: "Zayn Abbas", gender: "Male" },
  { img: "tariq-tanaka.webp", name: "Yusuf Khan", gender: "Male" },
  { img: "valentina-muller.webp", name: "Valentina Rossi", gender: "Female" },
  { img: "valentina-oliveira.webp", name: "Camila Oliveira", gender: "Female" },
  { img: "zainab-li.webp", name: "Zainab Rahman", gender: "Female" }
]; // 24 specific names (14 Male, 10 Female)

// We need 100 total. 75 Male, 25 Female.
// Specific has 14 Male, 10 Female.
// So generic needs 61 Male, 15 Female.

const maleFirstNames = [
  "James", "Michael", "Robert", "John", "David", "William", "Richard", "Joseph", "Thomas", "Charles",
  "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Kenneth", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan",
  "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon",
  "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry",
  "Tyler", "Aaron", "Jose", "Adam", "Henry", "Nathan", "Douglas", "Zachary", "Peter", "Kyle",
  "Walter", "Ethan", "Jeremy", "Harold"
]; // 64 names

const femaleFirstNames = [
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
  "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily"
]; // 18 names

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
  "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper",
  "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim"
]; // enough names

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

shuffle(maleFirstNames);
shuffle(femaleFirstNames);
shuffle(lastNames);
shuffle(specificAuthors);

const ageGroups = [];
for(let i=0; i<20; i++) ageGroups.push({ age: Math.floor(Math.random() * 6) + 25, exp: Math.floor(Math.random() * 5) + 2 });
for(let i=0; i<60; i++) ageGroups.push({ age: Math.floor(Math.random() * 15) + 31, exp: Math.floor(Math.random() * 14) + 8 });
for(let i=0; i<20; i++) ageGroups.push({ age: Math.floor(Math.random() * 15) + 46, exp: Math.floor(Math.random() * 12) + 23 });
shuffle(ageGroups);

let maleIndex = 0;
let femaleIndex = 0;
let lastNameIndex = 0;

const intlCities = ["London", "Berlin", "Madrid", "Rome", "Toronto", "Sydney", "Chicago", "Paris", "Amsterdam", "Stockholm", "New York"];

let specificIndex = 0;
let genericMaleCount = 0;
let genericFemaleCount = 0;

files.forEach((file, index) => {
  let content = fs.readFileSync(path.join(authorsDir, file), 'utf-8');
  
  // Extract old name to replace it in the body
  const titleMatch = content.match(/title:\s*"(.*?)"/);
  const oldName = titleMatch ? titleMatch[1] : null;
  const oldFirstName = oldName ? oldName.split(' ')[0] : null;
  
  // Determine new identity
  let newName, gender, newSlug, newImgPath;
  
  if (specificIndex < specificAuthors.length) {
    const spec = specificAuthors[specificIndex++];
    newName = spec.name;
    gender = spec.gender;
    newSlug = newName.toLowerCase().replace(/ /g, '-');
    newImgPath = `/images/authors/${newSlug}.webp`;
    
    // Rename actual image file
    const oldImgFullPath = path.join(imagesDir, spec.img);
    const newImgFullPath = path.join(imagesDir, `${newSlug}.webp`);
    if (fs.existsSync(oldImgFullPath)) {
      fs.copyFileSync(oldImgFullPath, newImgFullPath);
      fs.unlinkSync(oldImgFullPath);
    }
  } else {
    // Generate generic
    if (genericMaleCount < 61) {
      gender = "Male";
      genericMaleCount++;
    } else {
      gender = "Female";
      genericFemaleCount++;
    }
    const firstName = gender === "Male" ? maleFirstNames[maleIndex++] : femaleFirstNames[femaleIndex++];
    const lastName = lastNames[lastNameIndex++];
    newName = `${firstName} ${lastName}`;
    newSlug = newName.toLowerCase().replace(/ /g, '-');
    newImgPath = `/images/authors/placeholder.webp`; // Placeholder for others
  }
  
  const ageData = ageGroups[index];
  
  // Fix Turkish cities logic
  // The old regex might not catch everything if it's not specifically "Istanbul"
  // Let's replace ANY Turkish city found with a random international city
  const trCities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana'];
  trCities.forEach(city => {
    const cityRegex = new RegExp(`journey in ${city}`, 'gi');
    if (cityRegex.test(content)) {
      const randCity = intlCities[Math.floor(Math.random() * intlCities.length)];
      content = content.replace(cityRegex, `journey in ${randCity}`);
    }
  });
  
  // Also if the text just has "Istanbul" generically
  trCities.forEach(city => {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'g');
    if (cityRegex.test(content)) {
      const randCity = intlCities[Math.floor(Math.random() * intlCities.length)];
      content = content.replace(cityRegex, randCity);
    }
  });

  // Update frontmatter
  content = content.replace(/title:\s*".*?"/, `title: "${newName}"`);
  content = content.replace(/image:\s*".*?"/, `image: "${newImgPath}"`);
  
  // Update body text (years and names)
  content = content.replace(/Spent over \d+ years/g, `Spent over ${ageData.exp} years`);
  
  // Replace old names carefully
  if (oldName) {
    content = content.replace(new RegExp(oldName, 'g'), newName);
  }
  if (oldFirstName) {
    // Only replace first name if it is used standalone, e.g. "Jacob provides"
    content = content.replace(new RegExp(oldFirstName + ' provides', 'g'), newName.split(' ')[0] + ' provides');
    content = content.replace(new RegExp(oldFirstName + ' has', 'g'), newName.split(' ')[0] + ' has');
  }

  // Save new file
  const newFilePath = path.join(authorsDir, `${newSlug}.md`);
  fs.writeFileSync(newFilePath, content);
  
  // Delete old file if different
  if (`${newSlug}.md` !== file) {
    if (fs.existsSync(path.join(authorsDir, file))) {
      fs.unlinkSync(path.join(authorsDir, file));
    }
  }
});

console.log("Successfully applied all 100 author updates, remapped 24 images, and replaced Turkish cities!");
