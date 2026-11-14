/**
 * Synthetic submissions for eval 2. Each plants identity in the work and lists every planted
 * string, so the eval can assert that none of them reaches a reviewer.
 */
interface SubmissionFixture {
  name: string;
  contact: string;
  answer: string;
  explain: string;
  planted: string[];
}

export const SUBMISSIONS: SubmissionFixture[] = [
  {
    name: "Leila Haddad",
    contact: "leila.h@example.org",
    answer: "Hi, I'm Leila Haddad. The split leaks frames of the same grasp into test. Group by attempt. I studied at the University of Tehran and worked at Nordwave Systems.\n\nBest,\nLeila",
    explain: "As a mother of two I learned to check the boring parts first. Reach me at leila.h@example.org.",
    planted: ["Leila", "Haddad", "leila.h@example.org", "Tehran", "Nordwave", "mother of two"],
  },
  {
    name: "Mikael Rantanen",
    contact: "+358 40 555 0101",
    answer: "Threshold is tuned on the test set. Use a validation split. Call me on +358 40 555 0101 or see linkedin.com/in/mikaelrantanen. I live in Espoo.",
    explain: "I am 29 years old and have done this at Aalto for three years.",
    planted: ["Mikael", "Rantanen", "555 0101", "linkedin.com/in/mikaelrantanen", "Espoo", "29 years old", "Aalto"],
  },
  {
    name: "Priya Raman",
    contact: "priya.raman@example.org",
    answer: "Accuracy hides the 4% drops. Report recall on dropped grasps. As an Indian engineer who worked for Kestrelline Oy in Bangalore, I saw this often.",
    explain: "My portfolio is at https://priyaraman.example.org/projects. Born in 1994.",
    planted: ["Priya", "Raman", "Indian", "Kestrelline", "Bangalore", "priyaraman.example.org", "1994"],
  },
  {
    name: "Jonas Eklund",
    contact: "jonas@example.org",
    answer: "The frame-level split is the problem. Group frames by grasp attempt. I'm a native Swedish speaker from Gothenburg and studied at KTH.",
    explain: "Thanks for reading.\n\n- Jonas Eklund",
    planted: ["Jonas", "Eklund", "native Swedish speaker", "Gothenburg", "KTH", "jonas@example.org"],
  },
  {
    name: "Amina Yusuf",
    contact: "amina.yusuf@example.org",
    answer: "I would pick the threshold on validation data. Code is on github.com/aminayusuf/grasp-eval. I moved to Vantaa from Nigeria with my husband.",
    explain: "I am a Nigerian citizen, 41 years old, she/her.",
    planted: ["Amina", "Yusuf", "github.com/aminayusuf", "Vantaa", "Nigeria", "my husband", "41 years old", "she/her"],
  },
  {
    name: "Tuomas Heikkinen",
    contact: "040 1234567",
    answer: "Split by attempt and report recall. Minun nimeni on Tuomas Heikkinen. Opiskelin Oulun yliopistossa.",
    explain: "Soita 040 1234567. Asun Tampereella.",
    planted: ["Tuomas", "Heikkinen", "040 1234567", "Oulun yliopistossa", "Tampereella"],
  },
  {
    name: "Sofia Rossi",
    contact: "sofia.rossi@example.org",
    answer: "Accuracy is the wrong metric with 4% failures. I am Italian, 33 years old, and did my PhD at Politecnico di Milano. I currently work at Brightwell Analytics in Helsinki.",
    explain: "Regards, Sofia",
    planted: ["Sofia", "Rossi", "Italian", "33 years old", "Brightwell", "Helsinki"],
  },
  {
    name: "Ahmed Karimi",
    contact: "ahmed.karimi@example.org",
    answer: "The test frames leak from training. Use GroupKFold. As a father of three from Iran, I care about doing things right. Graduated from Sharif in 2015.",
    explain: "Contact: ahmed.karimi@example.org, www.ahmedkarimi.example.org",
    planted: ["Ahmed", "Karimi", "father of three", "Iran", "Sharif", "ahmed.karimi@example.org", "ahmedkarimi.example.org"],
  },
  {
    name: "Elena Popescu",
    contact: "+40 721 555 019",
    answer: "Threshold tuned on test data, so the number is optimistic. My name is Elena Popescu and I worked at Halvard Robotics for two years in Stockholm.",
    explain: "I'm 38 and a single mom. Phone +40 721 555 019.",
    planted: ["Elena", "Popescu", "Halvard", "Stockholm", "I'm 38", "single mom", "721 555 019"],
  },
  {
    name: "Chen Wei",
    contact: "chen.wei@example.org",
    answer: "Accuracy hides drops; use recall and precision on the rare class. Chinese national, studied at Tsinghua, now at Lumivo AB.",
    explain: "Cheers,\nChen Wei",
    planted: ["Chen", "Wei", "Chinese", "Tsinghua", "Lumivo"],
  },
  {
    name: "Maria Virtanen",
    contact: "maria.virtanen@example.org",
    answer: "I'd split by grasp attempt. Hi, this is Maria Virtanen from Turku, I graduated from Åbo Akademi and am on parental leave right now.",
    explain: "maria.virtanen@example.org, in my thirties.",
    planted: ["Maria", "Virtanen", "Turku", "Åbo Akademi", "parental leave", "in my thirties", "maria.virtanen@example.org"],
  },
  {
    name: "Kwame Mensah",
    contact: "kwame.mensah@example.org",
    answer: "Group frames by attempt and pick the threshold on validation. I'm Ghanaian, 27 years old, studied at the University of Ghana and interned at Solvent Grid Ltd in Accra.",
    explain: "Find me at linkedin.com/in/kwamemensah.\n\nThanks,\nKwame",
    planted: ["Kwame", "Mensah", "Ghanaian", "27 years old", "University of Ghana", "Solvent Grid", "Accra", "linkedin.com/in/kwamemensah"],
  },
];
