/**
 * Sample job ads for invented companies, served as plain pages under /ads/{slug}. They give the
 * "Paste your job ad link" flow real links to paste. Each ad has one or two wishes about a person, the way
 * real ads often do, so the drafter's set-aside rule has something to set aside.
 */
export interface SampleAd {
  slug: string;
  companyId: string;
  company: string;
  title: string;
  /** Where and how: one short line under the title. */
  facts: string;
  intro: string;
  youWill: string[];
  weLookFor: string[];
}

export const SAMPLE_ADS: readonly SampleAd[] = [
  {
    slug: "kide-chip-verification-engineer",
    companyId: "co-kide",
    company: "Kide Silicon",
    title: "Chip verification engineer",
    facts: "Otaniemi, Espoo. Full time. Work language English.",
    intro:
      "Kide Silicon designs chips for radio equipment. We are 60 people, and our next chip goes to the factory in the spring. We need one more engineer who makes sure our digital blocks meet their clock targets before they leave the building. You join a verification team of eight. We plan the work together on Monday mornings and keep Fridays free for learning and tidy-up. We pay for courses and conferences.",
    youWill: [
      "Run and read static timing reports for our digital blocks.",
      "Find the paths that fail and agree the fix with the designers.",
      "Write test plans and checks for new blocks.",
      "Explain timing problems to project managers in plain words.",
    ],
    weLookFor: [
      "A degree in electrical engineering, computer engineering or similar.",
      "Experience with static timing analysis and digital design.",
      "Clear thinking about what to try first when a path fails.",
      "A young and energetic team player.",
      "Native Finnish speaker.",
    ],
  },
  {
    slug: "halla-ai-developer",
    companyId: "co-halla",
    company: "Halla Supply",
    title: "AI developer",
    facts: "Leppävaara, Espoo. Full time. Work language Finnish or English.",
    intro:
      "Halla Supply sells spare parts for heat pumps to installers across Finland. We are 45 people. Much of our office work is still typed by hand: orders, invoices and the weekly sales report. We want our first developer who builds automation that people in the office actually use. You work with the office team every day and report to our finance and AI lead. Nobody here expects a big system on day one. We want small tools that work, and honest numbers about what they save.",
    youWill: [
      "Find the office work that is worth automating first.",
      "Build small tools that read delivery notes, orders and emails.",
      "Keep a person in the loop where a mistake would cost money.",
      "Show the team what changed, in numbers, every month.",
    ],
    weLookFor: [
      "A degree in computer science, engineering or similar, or equal experience.",
      "Practical experience with automation or AI tools.",
      "Good judgement about risk and about what to build first.",
      "A recent graduate under 30.",
    ],
  },
  {
    slug: "saarnivo-financial-analyst",
    companyId: "co-saarnivo",
    company: "Saarnivo Grid",
    title: "Financial analyst",
    facts: "Otaniemi, Espoo. Full time. Work language English.",
    intro:
      "Saarnivo Grid makes forecasting and control software for district heating and power grids. We are 70 people and growing. Our finance team of three needs an analyst who keeps budgets honest and explains the numbers to people who are not in finance. You work closely with team leads who plan events, hires and cloud costs. Most weeks you answer one question for them: can we afford this, and what does it change? We offer flexible hours and a quiet office by the sea.",
    youWill: [
      "Build and follow up the budgets of our teams and events.",
      "Check that the numbers add up and match the notes behind them.",
      "Say what a change in the numbers means for the plan.",
      "Prepare the monthly report for the management team.",
    ],
    weLookFor: [
      "A degree in economics, business or finance.",
      "Accuracy with numbers and with the story behind them.",
      "Clear writing for readers outside finance.",
      "Native Finnish speaker with a strong network in the industry.",
    ],
  },
  {
    slug: "revontuli-marketing-specialist",
    companyId: "co-revontuli",
    company: "Revontuli Games",
    title: "Marketing and communications specialist",
    facts: "Keilaniemi, Espoo. Full time. Work language English.",
    intro:
      "Revontuli Games makes puzzle games for phones, played by about two million people a month. We are 35 people. We want someone who knows why people share a video, and who tests ideas before the money goes in. You work with two game designers and one artist, and you own the plan for our social media. Small budgets, fast tests and honest numbers are how we work. We offer flexible hours and a game night every month.",
    youWill: [
      "Plan short videos and posts for our social media channels.",
      "Read what our past videos did, beyond the views.",
      "Run small tests before we spend the whole budget.",
      "Write the words people see first: titles, captions and store texts.",
    ],
    weLookFor: [
      "A degree in marketing, communications or similar.",
      "A good sense of what makes people send a video on.",
      "Comfort with numbers from social media tools.",
      "A digital native, young at heart, who fits our culture.",
    ],
  },
  {
    slug: "tuulos-software-engineer",
    companyId: "co-tuulos",
    company: "Tuulos Robotics",
    title: "Machine learning engineer",
    facts: "Kera, Espoo. Full time. Work language English.",
    intro:
      "Tuulos Robotics builds pick robots for cold-storage warehouses. Our team of 40 writes the software that decides how a robot grips a parcel. We need an engineer who checks how our models are tested before they go to the warehouses. You join a team of six that owns the grasp model, from training data to release. We release every two weeks, and a robot in a warehouse depends on every release. We offer a quiet desk, real robots to test on and flexible hours.",
    youWill: [
      "Review the code that trains and tests our grasp models.",
      "Find the bugs that make a test look better than real life.",
      "Write tests that catch those bugs next time.",
      "Explain results to the warehouse team in plain words.",
    ],
    weLookFor: [
      "A degree in computer science, data science or similar.",
      "Experience with Python and machine learning.",
      "Care for how a model is tested, not only how it is trained.",
      "Five years of experience and a degree from a top university.",
    ],
  },
];

export const SAMPLE_AD_PATHS: readonly string[] = SAMPLE_ADS.map((ad) => `/ads/${ad.slug}`);

export function sampleAd(slug: string): SampleAd | undefined {
  return SAMPLE_ADS.find((ad) => ad.slug === slug);
}
