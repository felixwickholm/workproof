/** Word lists for the blind layer. Finnish city names match with their case endings. */

export const FINNISH_CITY_STEMS = [
  "Helsin", "Espoo", "Vantaa", "Tampere", "Turku", "Turu", "Oulu", "Jyväskylä",
  "Lahti", "Lahde", "Kuopio", "Pori", "Joensuu", "Lappeenran", "Vaasa", "Rovanie", "Kotka", "Kotkan",
  "Hämeenlinna", "Seinäjo", "Kauniai", "Kerava", "Porvoo", "Otanie", "Leppävaara", "Tapiola", "Matinkylä",
  "Kallio", "Mikkeli", "Kajaani", "Kokkola", "Salo", "Hyvinkää", "Järvenpää", "Nurmijärvi", "Kirkkonummi",
  "Lohja", "Lohjal", "Rauma", "Raumal", "Savonlinna", "Kemi", "Tornio", "Iisalmi", "Imatra", "Hamina",
  "Raahe", "Riihimä", "Forssa", "Loviisa", "Tammisaa", "Hanko", "Hangon", "Kirkkonum", "Sipoo", "Tuusula",
  "Kemijärv", "Kuusamo", "Sodankylä", "Inari", "Maarianhamina", "Mariehamn", "Ahvenanmaa", "Åland",
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
  "Kraków", "Krakow", "Gdańsk", "Gdansk", "Wrocław", "Wroclaw", "Łódź", "Lodz", "Porto", "Seville", "Valencia",
  "Lyon", "Marseille", "Frankfurt", "Cologne", "Stuttgart", "Rotterdam", "Antwerp", "Geneva", "Kaunas",
  "Minsk", "Odesa", "Odessa", "Kharkiv", "Lviv", "Asmara", "Eritrea", "Sudan", "Khartoum", "Yemen",
  "Sanaa", "Saudi Arabia", "Riyadh", "Dubai", "Abu Dhabi", "Doha", "Qatar", "Kuwait", "Oman", "Erbil",
  "Kurdistan", "Mosul", "Basra", "Herat", "Kandahar", "Mashhad", "Karaj", "Ahvaz", "Tbilisi", "Yerevan",
  "Baku", "Almaty", "Tashkent", "Uzbekistan", "Myanmar", "Cambodia", "Laos", "Mongolia", "Taiwan",
  "Venezuela", "Cuba", "Ecuador", "Bolivia", "Uruguay", "Paraguay", "Cameroon", "Senegal", "Uganda",
  "Tanzania", "Rwanda", "Congo", "Zimbabwe", "Zambia", "Angola", "Mozambique", "Libya", "Mali",
];

export const SCHOOLS = [
  "Aalto", "Hanken", "Metropolia", "Haaga-Helia", "Laurea", "Arcada", "LUT", "LAB", "TAMK", "Oamk",
  "JAMK", "Savonia", "Xamk", "Novia", "Åbo Akademi", "KTH", "Chalmers", "DTU", "NTNU", "ETH", "EPFL",
  "TU Delft", "TU Munich", "TUM", "RWTH", "MIT", "Caltech", "Stanford", "Harvard", "Yale", "Princeton",
  "Berkeley", "Oxford", "Cambridge", "Imperial College", "UCL", "IIT", "IITs", "IISc", "BITS Pilani",
  "NIT", "Sharif", "Amirkabir", "Tsinghua", "Peking University", "Fudan", "NUS", "NTU", "KAIST",
  "Technion", "AUB", "Sorbonne", "Polytechnique", "Bocconi", "INSEAD",
  "HY", "TY", "TTY", "JY", "OY", "UEF", "TUNI", "TAU", "Tampere Uni", "Turku Uni", "KU Leuven", "LSE", "KCL",
  "UvA", "TU Wien", "Uni Helsinki", "Helsinki Uni", "Humak", "Diak", "Turku AMK", "Haaga", "Hanken School of Economics",
  "Kyiv Medical Institute No. 2", "Kyiv Medical Institute", "Medical Institute No. 2",
];

/** School names long enough to match in any case: "aalto university", "metropolia". */
export const SCHOOLS_ANY_CASE = SCHOOLS.filter((name) => name.length >= 5 && name !== name.toUpperCase());

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
  "Eritrean", "Sudanese", "Yemeni", "Saudi", "Emirati", "Qatari", "Kuwaiti", "Omani", "Libyan", "Malian",
  "Senegalese", "Cameroonian", "Ugandan", "Tanzanian", "Rwandan", "Congolese", "Zimbabwean", "Angolan",
  "Venezuelan", "Cuban", "Ecuadorian", "Bolivian", "Uruguayan", "Paraguayan", "Mongolian", "Taiwanese",
  "Burmese", "Cambodian", "Lao", "Uzbek", "Kazakh", "Azerbaijani", "Tajik", "Turkmen", "Latvian",
  "Lithuanian", "Czech", "Slovak", "Hungarian", "Romanian", "Bulgarian", "Serbian", "Croatian", "Bosnian",
  "Slovenian", "Albanian", "Macedonian", "Moldovan", "Hispanic", "Latino", "Latina", "Asian", "African",
  "Caucasian", "Sami", "Roma", "Tamil", "Punjabi", "Bengali",
  "suomalainen", "suomalaisena", "ruotsalainen", "virolainen", "venäläinen", "somalialainen", "irakilainen",
  "iranilainen", "syyrialainen", "afganistanilainen", "intialainen", "kiinalainen", "ulkomaalainen",
  "maahanmuuttaja", "maahanmuuttajana", "finländare", "svensk", "invandrare",
];

/** Employers named often enough to hide even without "worked at". Platform names (Google, Microsoft) are left out: they name tools. */
export const KNOWN_EMPLOYERS = [
  "Nokia", "Supercell", "Wolt", "Rovio", "Kone", "Fortum", "Neste", "Reaktor", "Futurice", "Vincit", "Solita",
  "Tietoevry", "Tieto", "Elisa", "Telia", "Nordea", "Wärtsilä", "Valmet", "Stora Enso", "Kesko", "Finnair",
  "Ericsson", "Klarna", "Zalando", "Smartly", "Relex", "Varjo", "Oura", "Aiven", "Remedy", "Alma Media",
  "Sanoma", "YLE", "Yle", "Posti", "Fiskars", "Marimekko", "Iittala", "Konecranes", "Outokumpu",
  "Metso", "Valio", "Fazer", "Paulig", "Lindex", "Volvo", "Saab", "Scania", "IKEA", "H&M", "Accenture",
  "Deloitte", "KPMG", "PwC", "McKinsey", "Capgemini", "Siili", "Gofore", "Nitor", "Knowit", "Digia",
];

/** Capitalised words after "worked at" and similar that are not employers. */
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
  "Pandas", "NumPy", "Numpy", "SciPy", "PyTorch", "TensorFlow", "Keras", "Jupyter", "Figure", "Fig", "Table",
  "Section", "Chapter", "Appendix", "Kaggle", "Night", "Approval", "Scale", "Rust", "Go", "Node", "Next",
  "Vue", "Angular", "Svelte", "Redis", "Mongo", "MongoDB", "MySQL", "SQLite", "Snowflake", "BigQuery",
  "Databricks", "Tableau", "Looker", "Jira", "Confluence", "Slack", "Teams", "Notion", "Figma", "Sheets",
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "OpenAI", "Anthropic", "Claude", "ChatGPT", "Copilot",
  "Hugging", "Face", "HuggingFace", "Vercel", "Netlify", "Heroku", "Stripe", "Shopify", "Salesforce", "SAP",
  "Monday", "Prod", "Production", "Staging", "Dev", "Test", "Work", "Home", "School", "Uni", "University",
]);

/** Capitalised words that are not names: tools, months, days and terms. Used by the intro rules. */
export const NOT_NAMES = new Set([...NOT_EMPLOYERS, "Mr", "Ms", "Mrs", "Dr", "Hi", "Hello", "Hey", "Thanks", "Yes", "No", "Ok", "OK"]);

/** Lowercase common words. A name part that is also one of these is hidden only where its capital marks a name. */
export const COMMON_WORDS = new Set(
  (
    "a an the and or but if then so to of in on at by for with from up down out over under again further once here there when where why how " +
    "all any both each few more most other some such no nor not only own same than too very can will just should now may might must shall " +
    "would could also well still even back much many way new old good bad great high low big small long short right left first last next " +
    "sure fine happy glad ready confident running working writing looking going done open free clear true false real full able afraid aware " +
    "here also mark grace hope faith joy rose lily ruby amber dawn summer autumn june april august bill bob will may art drew jack ray " +
    "rich sky star storm hunter mason miles max young king guy pat sue gene dean frank earl grant lane page reed wade wolf bay cash chase " +
    "nice not very trying thinking saying doing seeing using building testing fixing reviewing curious new interested excited sorry " +
    "afraid going leaving coming back available busy late early tired honest pleased responsible senior junior lead head chief " +
    "this that these those it its they them their we our you your he she his her i me my am is are was were be been being have has had do does did"
  ).split(/\s+/),
);
