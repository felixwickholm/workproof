/** Word lists for the blind layer. Finnish city names match with their case endings. */

export const FINNISH_CITY_STEMS = [
  "Helsin", "Espoo", "Vantaa", "Tamper", "Turku", "Turu", "Oulu", "Jyväskylä",
  "Lahti", "Lahde", "Kuopio", "Pori", "Joensuu", "Lappeenran", "Vaasa", "Rovanie", "Kotka", "Kotkan",
  "Hämeenlinna", "Seinäjo", "Kauniai", "Kerava", "Porvoo", "Otanie", "Leppävaara", "Tapiola", "Matinkylä",
  "Kallio", "Mikkeli", "Kajaani", "Kokkola", "Salo", "Hyvinkää", "Järvenpää", "Nurmijärvi", "Kirkkonummi",
];

export const PLACES = [
  "Finland", "Suomi", "Sweden", "Norway", "Denmark", "Estonia", "Iceland", "Germany", "France", "Spain",
  "Italy", "Portugal", "Poland", "Netherlands", "Belgium", "Austria", "Switzerland", "Ireland", "Greece",
  "United Kingdom", "UK", "England", "Scotland", "United States", "USA", "Canada", "Mexico", "Brazil",
  "Argentina", "Colombia", "Chile", "Peru", "Iran", "Iraq", "Syria", "Lebanon", "Jordan", "Israel",
  "Palestine", "Egypt", "Morocco", "Tunisia", "Algeria", "Nigeria", "Ghana", "Kenya", "Ethiopia",
  "Somalia", "South Africa", "Turkey", "Russia", "Ukraine", "Belarus", "Georgia", "Armenia",
  "Azerbaijan", "Kazakhstan", "India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Afghanistan",
  "China", "Japan", "Korea", "Vietnam", "Thailand", "Philippines", "Indonesia", "Malaysia", "Singapore",
  "Australia", "New Zealand",
  "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Oslo", "Bergen", "Copenhagen", "Aarhus", "Tallinn",
  "Tartu", "Riga", "Vilnius", "Berlin", "Munich", "Hamburg", "London", "Manchester", "Paris", "Madrid",
  "Barcelona", "Lisbon", "Rome", "Milan", "Amsterdam", "Brussels", "Vienna", "Zurich", "Warsaw",
  "Prague", "Budapest", "Dublin", "Athens", "Istanbul", "Ankara", "Kyiv", "Kiev", "Moscow",
  "Saint Petersburg", "Tehran", "Isfahan", "Shiraz", "Tabriz", "Beirut", "Damascus", "Aleppo", "Baghdad",
  "Amman", "Cairo", "Alexandria", "Casablanca", "Lagos", "Abuja", "Accra", "Nairobi", "Addis Ababa",
  "Mogadishu", "Johannesburg", "Cape Town", "Mumbai", "Delhi", "New Delhi", "Bangalore", "Bengaluru",
  "Chennai", "Hyderabad", "Pune", "Kolkata", "Karachi", "Lahore", "Islamabad", "Dhaka", "Kathmandu",
  "Colombo", "Kabul", "Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Hong Kong", "Taipei", "Tokyo",
  "Osaka", "Seoul", "Hanoi", "Ho Chi Minh City", "Bangkok", "Manila", "Jakarta", "Kuala Lumpur",
  "Sydney", "Melbourne", "Toronto", "Vancouver", "Montreal", "New York", "San Francisco", "Seattle",
  "Boston", "Chicago", "Los Angeles", "Austin", "Mexico City", "São Paulo", "Sao Paulo", "Rio de Janeiro",
  "Buenos Aires", "Bogotá", "Bogota", "Lima", "Santiago",
];

export const SCHOOLS = [
  "Aalto", "Hanken", "Metropolia", "Haaga-Helia", "Laurea", "Arcada", "LUT", "LAB", "TAMK", "Oamk",
  "JAMK", "Savonia", "Xamk", "Novia", "Åbo Akademi", "KTH", "Chalmers", "DTU", "NTNU", "ETH", "EPFL",
  "TU Delft", "TU Munich", "TUM", "RWTH", "MIT", "Caltech", "Stanford", "Harvard", "Yale", "Princeton",
  "Berkeley", "Oxford", "Cambridge", "Imperial College", "UCL", "IIT", "IITs", "IISc", "BITS Pilani",
  "NIT", "Sharif", "Amirkabir", "Tsinghua", "Peking University", "Fudan", "NUS", "NTU", "KAIST",
  "Technion", "AUB", "Sorbonne", "Polytechnique", "Bocconi", "INSEAD",
];

/** Adjectives that state where someone is from. English is left out: it names a language people work in. */
export const NATIONALITIES = [
  "Finnish", "Swedish", "Norwegian", "Danish", "Estonian", "Icelandic", "German", "French", "Spanish",
  "Italian", "Portuguese", "Polish", "Dutch", "Belgian", "Austrian", "Swiss", "Irish", "Greek",
  "British", "Scottish", "American", "Canadian", "Mexican", "Brazilian", "Argentinian", "Colombian",
  "Chilean", "Peruvian", "Iranian", "Persian", "Iraqi", "Syrian", "Lebanese", "Jordanian", "Israeli",
  "Palestinian", "Egyptian", "Moroccan", "Tunisian", "Algerian", "Nigerian", "Ghanaian", "Kenyan",
  "Ethiopian", "Somali", "South African", "Turkish", "Kurdish", "Russian", "Ukrainian", "Belarusian",
  "Georgian", "Armenian", "Indian", "Pakistani", "Bangladeshi", "Sri Lankan", "Nepali", "Nepalese",
  "Afghan", "Chinese", "Japanese", "Korean", "Vietnamese", "Thai", "Filipino", "Filipina", "Indonesian",
  "Malaysian", "Australian", "Arab", "Arabic-speaking",
];

/** Capitalised words that follow "at" or "for" but are not employers. */
export const NOT_EMPLOYERS = new Set([
  "I", "A", "An", "The", "This", "That", "These", "Those", "My", "Our", "Your", "Their", "It", "We",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
  "November", "December", "Christmas", "Easter",
  "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Python", "Java", "JavaScript", "TypeScript", "SQL",
  "React", "Postgres", "PostgreSQL", "Linux", "Windows", "Mac", "iOS", "Android", "Git", "GitHub",
  "Terraform", "Kafka", "Spark", "Airflow", "Excel", "Monday's", "Tryout", "Proof", "AI", "API", "UI",
  "UX", "QA", "ML", "LLM", "CI", "CD", "PR", "MVP", "Q1", "Q2", "Q3", "Q4", "Week", "Step", "Line",
  "First", "Second", "Third", "Least", "Most", "Some", "All", "Any", "Each", "Every", "Scale", "Risk",
]);
