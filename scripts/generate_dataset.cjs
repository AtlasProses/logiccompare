const fs = require('fs');
const path = require('path');

// --- Configuration ---
const TOTAL_AUTHORS = 100;
const DIST = {
    Tech: 60,
    Finance: 20,
    Sports: 20
};
const AGE_DIST = {
    young: 20, // 25-30
    mid: 60,   // 30-50
    senior: 20 // 45-60
};

// --- Data Pools ---
const categories = {
    Tech: ["AI & Machine Learning", "Cloud & Serverless", "IoT & Smart Automation", "Automotive & EV Tech", "Cybersecurity", "EdTech & Certifications", "Consumer Gadgets"],
    Finance: ["Markets & Stocks", "Crypto & Web3", "Real Estate & Housing", "Mortgage & Banking", "Macroeconomics"],
    Sports: ["Premier League", "NBA & Basketball", "Match Predictions"]
};

const names = [
    // US / UK
    { first: "James", last: "Miller", gender: "Male", country: "United States", city: "San Francisco", style: "american" },
    { first: "Eleanor", last: "Hughes", gender: "Female", country: "United Kingdom", city: "London", style: "british" },
    { first: "Alexander", last: "Vance", gender: "Male", country: "Canada", city: "Toronto", style: "canadian" },
    { first: "Sarah", last: "Mitchell", gender: "Female", country: "United States", city: "New York", style: "american" },
    { first: "Michael", last: "Brown", gender: "Male", country: "Australia", city: "Sydney", style: "australian" },
    // European
    { first: "Felix", last: "Müller", gender: "Male", country: "Germany", city: "Berlin", style: "german" },
    { first: "Camille", last: "Dubois", gender: "Female", country: "France", city: "Paris", style: "french" },
    { first: "Marco", last: "Conti", gender: "Male", country: "Italy", city: "Milan", style: "italian" },
    { first: "Beatriz", last: "Costa", gender: "Female", country: "Portugal", city: "Lisbon", style: "portuguese" },
    { first: "Anna", last: "Kowalska", gender: "Female", country: "Poland", city: "Warsaw", style: "polish" },
    { first: "Diego", last: "Lopez", gender: "Male", country: "Spain", city: "Madrid", style: "spanish" },
    { first: "Elena", last: "Volkova", gender: "Female", country: "Russia", city: "Moscow", style: "russian" },
    // Asian
    { first: "Hiroshi", last: "Tanaka", gender: "Male", country: "Japan", city: "Tokyo", style: "japanese" },
    { first: "Li", last: "Wei", gender: "Male", country: "China", city: "Shanghai", style: "chinese" },
    { first: "Nguyen", last: "Thi Mai", gender: "Female", country: "Vietnam", city: "Ho Chi Minh City", style: "vietnamese" },
    { first: "Anjali", last: "Desai", gender: "Female", country: "India", city: "Mumbai", style: "indian" },
    { first: "Rahul", last: "Sharma", gender: "Male", country: "India", city: "Bangalore", style: "indian" },
    // Middle Eastern / African
    { first: "Aisha", last: "Rahman", gender: "Female", country: "UAE", city: "Dubai", style: "arab" },
    { first: "Omar", last: "Al-Hassan", gender: "Male", country: "Egypt", city: "Cairo", style: "arab" },
    { first: "Kwame", last: "Osei", gender: "Male", country: "Ghana", city: "Accra", style: "african" },
    { first: "Amara", last: "Ndiaye", gender: "Female", country: "Senegal", city: "Dakar", style: "african" },
    { first: "Zola", last: "Ndlovu", gender: "Female", country: "South Africa", city: "Cape Town", style: "african" },
    // Turkish
    { first: "Kaan", last: "Demir", gender: "Male", country: "Turkey", city: "Istanbul", style: "turkish" },
    { first: "Zeynep", last: "Kaya", gender: "Female", country: "Turkey", city: "Ankara", style: "turkish" }
];

// Expanded name lists to ensure 100 unique items
const firstNamesM = ["James","John","Robert","Michael","William","David","Richard","Joseph","Thomas","Charles","Christopher","Daniel","Matthew","Anthony","Mark","Donald","Steven","Paul","Andrew","Joshua","Kenneth","Kevin","Brian","George","Timothy","Ronald","Edward","Jason","Jeffrey","Ryan","Jacob","Gary","Nicholas","Eric","Jonathan","Stephen","Larry","Justin","Scott","Brandon","Benjamin","Samuel","Gregory","Alexander","Frank","Patrick","Raymond","Jack","Dennis","Jerry"];
const firstNamesF = ["Mary","Patricia","Linda","Barbara","Elizabeth","Jennifer","Maria","Susan","Margaret","Dorothy","Lisa","Nancy","Karen","Betty","Helen","Sandra","Donna","Carol","Ruth","Sharon","Michelle","Laura","Sarah","Kimberly","Deborah","Jessica","Shirley","Cynthia","Angela","Melissa","Brenda","Amy","Anna","Rebecca","Virginia","Kathleen","Pamela","Martha","Debra","Amanda","Stephanie","Carolyn","Christine","Marie","Janet","Catherine","Frances","Ann","Joyce","Diane"];
const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"];

const universities = [
    "Massachusetts Institute of Technology (MIT)", "Stanford University", "University of Oxford", "University of Cambridge", 
    "Harvard University", "National University of Singapore (NUS)", "ETH Zurich", "Tsinghua University", 
    "University of Tokyo", "Technical University of Munich (TUM)", "Imperial College London", "University of Toronto",
    "Bogazici University", "Indian Institute of Technology (IIT)", "University of Melbourne"
];

const hobbies = [
    "Rock climbing", "Sailing", "Collecting rare first-edition books", "Marathon running", "Chess", 
    "Oil painting", "Playing the cello", "Amateur astronomy", "Scuba diving", "Gourmet cooking",
    "Photography", "Pottery", "Fencing", "Bird watching", "Hiking in the Alps", "Restoring vintage cars",
    "Windsurfing", "Urban gardening", "Writing poetry", "Bouldering"
];

const langSets = [
    "English (Native), Spanish (Fluent)", "English (Native), French (Fluent), German (Conversational)", 
    "Japanese (Native), English (Fluent)", "Mandarin (Native), English (Fluent), Cantonese",
    "German (Native), English (Fluent)", "Turkish (Native), English (Fluent), Russian",
    "Arabic (Native), English (Fluent), French", "English (Native), Hindi, Spanish",
    "French (Native), English (Fluent), Italian", "Russian (Native), English (Fluent)",
    "English (Native)"
];

const taglinesTech = [
    "Building the future, one line of code at a time.",
    "Data is the new oil, and AI is the combustion engine.",
    "Securing the digital frontier against tomorrow's threats.",
    "Making smart devices actually smart.",
    "Connecting the physical world with cloud logic."
];
const taglinesFin = [
    "The future of finance isn't stored in a vault.",
    "Analyzing the macro trends that shape our global economy.",
    "Navigating the volatile world of digital assets.",
    "Decoding the signals in the noise of the stock market.",
    "Real estate is not just property, it's a living ecosystem."
];
const taglinesSports = [
    "Where data meets the pitch.",
    "Predicting the unpredictable in modern sports.",
    "Beyond the box score: the hidden metrics of victory.",
    "Analyzing the beautiful game through numbers.",
    "From courtside to spreadsheets: decoding basketball strategy."
];

// Generate unique names
const usedNames = new Set();
function getUniqueName(gender) {
    let attempts = 0;
    while(attempts < 100) {
        const first = gender === "Male" ? firstNamesM[Math.floor(Math.random() * firstNamesM.length)] : firstNamesF[Math.floor(Math.random() * firstNamesF.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        const full = `${first} ${last}`;
        if (!usedNames.has(full)) {
            usedNames.add(full);
            return { first, last };
        }
        attempts++;
    }
    return { first: "Alex", last: "Smith" + Math.floor(Math.random()*1000) };
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

let generatedCount = 0;
const authors = [];

function createAuthor(mainCategory, ageGroup) {
    let subCategories = categories[mainCategory];
    let subCategory = getRandom(subCategories);
    
    // Pick base profile from our 24 crafted names or generate
    let base;
    if (generatedCount < names.length) {
        base = names[generatedCount];
        usedNames.add(`${base.first} ${base.last}`);
    } else {
        const gender = Math.random() > 0.5 ? "Male" : "Female";
        const generated = getUniqueName(gender);
        base = {
            first: generated.first,
            last: generated.last,
            gender: gender,
            country: "United States", // fallback
            city: "New York",
            style: "american"
        };
        // Mix up countries
        if (Math.random() > 0.5) {
            const randomBase = getRandom(names);
            base.country = randomBase.country;
            base.city = randomBase.city;
            base.style = randomBase.style;
        }
    }
    
    let age;
    if (ageGroup === 'young') age = Math.floor(Math.random() * (30 - 25 + 1)) + 25;
    else if (ageGroup === 'mid') age = Math.floor(Math.random() * (50 - 31 + 1)) + 31;
    else age = Math.floor(Math.random() * (60 - 45 + 1)) + 45;

    let degree = ageGroup === 'young' ? "B.S." : (Math.random() > 0.5 ? "M.S." : "Ph.D.");
    let uni = getRandom(universities);
    let education = `${uni} - ${degree} in ${mainCategory === 'Tech' ? 'Computer Science' : (mainCategory === 'Finance' ? 'Economics' : 'Data Science')}.`;
    
    let titlePrefix = ageGroup === 'young' ? "Lead Analyst" : (ageGroup === 'mid' ? "Senior Expert" : "Former Director / Veteran Specialist");
    let exp = ageGroup === 'young' ? `Over ${age - 22} years of focused experience in ${subCategory}.` : `Spent over ${age - 25} years bridging the gap between traditional methodologies and innovative ${subCategory} systems.`;
    
    let taglineArr = mainCategory === 'Tech' ? taglinesTech : (mainCategory === 'Finance' ? taglinesFin : taglinesSports);
    let tagline = getRandom(taglineArr);
    
    let bio = `${base.first} ${base.last} has built a remarkable career focused on ${subCategory}. ${exp} Having started their journey in ${base.city}, ${base.first} provides razor-sharp commentary and deep analytical insights into the shifting paradigms of ${mainCategory.toLowerCase()}. Their work consistently highlights the intersection of raw data and human experience.`;

    let hobby1 = getRandom(hobbies);
    let hobby2 = getRandom(hobbies);
    while(hobby1 === hobby2) hobby2 = getRandom(hobbies);

    const author = {
        id: generatedCount + 1,
        name: `${base.first} ${base.last}`,
        gender: base.gender,
        age: age,
        birthplace: `${base.city}, ${base.country}`,
        country: base.country,
        category: mainCategory,
        subCategory: subCategory,
        tagline: tagline,
        education: education,
        workExperience: `${titlePrefix} specializing in ${subCategory}. Prior experience includes leading innovative projects in top-tier global firms.`,
        specialties: `${subCategory}, Analytical Research, Strategic Forecasting`,
        languages: getRandom(langSets),
        hobbies: `${hobby1}, ${hobby2}.`,
        bio: bio,
        style: base.style
    };

    authors.push(author);
    generatedCount++;
}

// Generate Tech
for (let i = 0; i < DIST.Tech; i++) {
    let ageGrp = i < (DIST.Tech * 0.2) ? 'young' : (i < (DIST.Tech * 0.8) ? 'mid' : 'senior');
    createAuthor('Tech', ageGrp);
}
// Generate Finance
for (let i = 0; i < DIST.Finance; i++) {
    let ageGrp = i < (DIST.Finance * 0.2) ? 'young' : (i < (DIST.Finance * 0.8) ? 'mid' : 'senior');
    createAuthor('Finance', ageGrp);
}
// Generate Sports
for (let i = 0; i < DIST.Sports; i++) {
    let ageGrp = i < (DIST.Sports * 0.2) ? 'young' : (i < (DIST.Sports * 0.8) ? 'mid' : 'senior');
    createAuthor('Sports', ageGrp);
}

// Write to JSON
const outputPath = path.join(__dirname, 'authors_dataset.json');
fs.writeFileSync(outputPath, JSON.stringify(authors, null, 2), 'utf-8');

console.log(`Successfully generated ${authors.length} authors and saved to ${outputPath}`);
