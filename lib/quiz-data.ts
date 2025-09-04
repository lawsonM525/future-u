export interface QuizQuestion {
  id: number
  prompt: string
  section?: string
  minWords?: number
  maxWords?: number
  type?: 'text' | 'scale' | 'choice'
  options?: string[]
  placeholder?: string
  helpText?: string
}

export interface QuizSection {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  icon?: string
}

export interface QuizConfig {
  id: string
  name: string
  description: string
  totalQuestions: number
  estimatedTime: string
  sections?: QuizSection[]
  questions: QuizQuestion[]
  features: string[]
}

// Quiz configurations
export const quizConfigs: Record<string, QuizConfig> = {
  test: {
    id: 'test',
    name: 'Test Quiz',
    description: 'A quick test to see how things work',
    totalQuestions: 3,
    estimatedTime: '2 minutes',
    features: ['Quick test', 'Basic insights'],
    questions: [
      {
        id: 1,
        prompt: "What is your current job title?",
        placeholder: "e.g., Software Engineer, Marketing Manager, Student...",
        maxWords: 100
      },
      {
        id: 2,
        prompt: "What industry do you want to work in?",
        placeholder: "e.g., Technology, Healthcare, Finance...",
        maxWords: 100
      },
      {
        id: 3,
        prompt: "What's your dream job?",
        placeholder: "Describe your ideal role...",
        maxWords: 100,
        helpText: "Be as specific or as general as you'd like"
      }
    ]
  },
  
  quickie: {
    id: 'quickie',
    name: 'The Quickie',
    description: 'Short, quick insights. You get a snapshot of your next steps.',
    totalQuestions: 10,
    estimatedTime: '5-10 minutes',
    features: ['Quick insights', 'Career direction', 'Next steps'],
    questions: [
      {
        id: 1,
        prompt: "What are your career goals for the next 5 years?",
        type: 'choice',
        options: [
          "Level up my title",
          "Switch industries",
          "Start a startup",
          "Go remote forever",
          "Become a people manager",
          "Deepen my expertise",
          "Do what I love (and get paid)",
          "Take a sabbatical then relaunch"
        ],
        placeholder: "Where do you see yourself professionally?",
        maxWords: 100
      },
      {
        id: 2,
        prompt: "What skills do you currently possess?",
        type: 'choice',
        options: [
          "Coding",
          "Design",
          "Data analysis",
          "Writing",
          "Marketing",
          "Sales",
          "Project management",
          "Product sense",
          "Ops/Execution",
          "People skills"
        ],
        placeholder: "List your top skills and expertise",
        maxWords: 100
      },
      {
        id: 3,
        prompt: "What industry interests you the most?",
        type: 'choice',
        options: [
          "Tech",
          "Healthcare",
          "Finance",
          "Creative/Media",
          "Climate/Sustainability",
          "Education",
          "Government/Public Sector",
          "Nonprofit/Social Impact",
          "E-commerce",
          "Sports/Entertainment"
        ],
        placeholder: "Which field excites you?",
        maxWords: 100
      },
      {
        id: 4,
        prompt: "Describe your ideal work environment.",
        type: 'choice',
        options: [
          "Remote",
          "Hybrid",
          "In-office",
          "Small team",
          "Big org",
          "Async/low-meeting",
          "Fast-paced",
          "Chill vibes",
          "Dog-friendly"
        ],
        placeholder: "Remote? Office? Team size? Culture?",
        maxWords: 100
      },
      {
        id: 5,
        prompt: "What's your educational background?",
        type: 'choice',
        options: [
          "High school",
          "Associate's",
          "Bachelor's",
          "Master's",
          "PhD",
          "Bootcamp",
          "Self-taught",
          "YouTube University"
        ],
        placeholder: "Degrees, certifications, courses...",
        maxWords: 100
      },
      {
        id: 6,
        prompt: "What are your salary expectations?",
        type: 'choice',
        options: [
          "Experience-based (let's discuss)",
          "$50k-$80k",
          "$80k-$120k",
          "$120k-$180k",
          "$180k+",
          "Bag secured ( SEVEN figures)",
          "Open to equity-heavy comp"
        ],
        placeholder: "Be honest about your financial goals",
        maxWords: 100
      },
      {
        id: 7,
        prompt: "What skills would you like to develop?",
        type: 'choice',
        options: [
          "Leadership",
          "Coding/Automation",
          "Design/UI",
          "Data/AI",
          "Public speaking",
          "Sales",
          "Networking",
          "Writing",
          "Time management",
          "Negotiation"
        ],
        placeholder: "What do you want to learn next?",
        maxWords: 100
      },
      {
        id: 8,
        prompt: "What's your preferred work style?",
        type: 'choice',
        options: ["Independent", "Collaborative", "Structured", "Flexible", "Remote", "On-site"],
        placeholder: "Independent? Collaborative? Structured?",
        maxWords: 100
      },
      {
        id: 9,
        prompt: "What challenges are you facing in your career?",
        type: 'choice',
        options: [
          "Lack of clarity",
          "Imposter syndrome",
          "No experience",
          "Weak portfolio/resume",
          "Limited network",
          "Burnout",
          "No time",
          "Job market yikes",
          "Interview nerves"
        ],
        placeholder: "What's holding you back?",
        maxWords: 100
      },
      {
        id: 10,
        prompt: "What motivates you professionally?",
        type: 'choice',
        options: [
          "Moneeyyyy",
          "Impact",
          "Recognition",
          "Learning",
          "Autonomy",
          "Career growth",
          "Work-life balance",
          "Stability",
          "Fun team",
          "Mission-driven work"
        ],
        placeholder: "What drives you to succeed?",
        maxWords: 100
      }
    ]
  },

  medium: {
    id: 'medium',
    name: "I've Got Some Time",
    description: 'Medium-depth career analysis. More detailed insights.',
    totalQuestions: 40,
    estimatedTime: '20-30 minutes',
    features: ['Detailed analysis', 'Personalized roadmap', 'Skill gap analysis', 'Industry insights'],
    sections: [
      {
        id: 'current-situation',
        title: 'Current Situation',
        description: 'Let\'s understand where you are today',
        icon: '📍',
        questions: []
      },
      {
        id: 'future-aspirations',
        title: 'Future Aspirations',
        description: 'Let\'s explore your dreams and goals',
        icon: '🎯',
        questions: []
      }
    ],
    questions: [
      // Current Situation (20 questions)
      {
        id: 1,
        section: 'current-situation',
        prompt: "What's your current job or role in life?",
        type: 'choice',
        options: [
          "Student",
          "Full-time employee",
          "Part-time",
          "Freelancer/Contractor",
          "Entrepreneur",
          "Career explorer",
          "Caregiver",
          "Between gigs",
          "Content creator",
          "Retired",
          "Other"
        ],
        placeholder: "Your current position or situation",
        maxWords: 100
      },
      {
        id: 2,
        section: 'current-situation',
        prompt: "How would you describe yourself in one sentence today?",
        type: 'choice',
        options: [
          "Focused",
          "Curious",
          "Ambitious",
          "Overwhelmed (but vibing)",
          "Creative",
          "Analytical",
          "Calm & consistent",
          "Burnt out (recharging)",
          "Team player",
          "Lone wolf",
          "Chaotic good"
        ],
        placeholder: "A brief self-description",
        maxWords: 100
      },
      {
        id: 3,
        section: 'current-situation',
        prompt: "What skills do you use most often in your work?",
        type: 'choice',
        options: [
          "Communication",
          "Writing",
          "Design/UI",
          "Coding/Automation",
          "Data analysis",
          "Project management",
          "Customer support",
          "Sales",
          "Research",
          "Problem-solving"
        ],
        placeholder: "Your most-used abilities",
        maxWords: 100
      },
      {
        id: 4,
        section: 'current-situation',
        prompt: "What's one skill you feel confident in?",
        type: 'choice',
        options: [
          "Public speaking",
          "Organization",
          "Troubleshooting",
          "Collaboration",
          "Visual design",
          "Storytelling",
          "Negotiation",
          "Teaching",
          "Documentation",
          "Time management"
        ],
        placeholder: "Your strongest skill",
        maxWords: 100
      },
      {
        id: 5,
        section: 'current-situation',
        prompt: "How satisfied are you with your current career path? (1-10)",
        type: 'scale',
        placeholder: "Rate from 1 (very unsatisfied) to 10 (very satisfied)",
        maxWords: 100
      },
      {
        id: 6,
        section: 'current-situation',
        prompt: "What's a challenge you're facing in your work right now?",
        type: 'choice',
        options: [
          "Time management",
          "Prioritization",
          "Motivation",
          "Communication gaps",
          "Ambiguous goals",
          "Lack of mentorship",
          "Tooling/tech debt",
          "Burnout",
          "Imposter syndrome",
          "Job market yikes"
        ],
        placeholder: "Current work obstacles",
        maxWords: 100
      },
      {
        id: 7,
        section: 'current-situation',
        prompt: "Where do you live, and how do you feel about it?",
        type: 'choice',
        options: [
          "Big city — love it",
          "Big city — meh",
          "Suburbs — cozy",
          "Rural — peaceful",
          "Remote — digital nomad",
          "Campus life",
          "With family — saving coins",
          "With roommates — chaotic neutral",
          "On the move — traveling",
          "Prefer not to say"
        ],
        placeholder: "Your location and feelings about it",
        maxWords: 100
      },
      {
        id: 8,
        section: 'current-situation',
        prompt: "How do you feel about your current work-life balance?",
        type: 'choice',
        options: [
          "Balanced-ish",
          "Too much work",
          "Too much life (help)",
          "Always on-call",
          "4-day week please",
          "Boundaries solid",
          "What is balance?",
          "Depends on season"
        ],
        placeholder: "Your thoughts on balance",
        maxWords: 100
      },
      {
        id: 9,
        section: 'current-situation',
        prompt: "What's one thing you'd like to change about your daily life?",
        type: 'choice',
        options: [
          "More sleep",
          "More exercise",
          "Less screen time",
          "Healthier meals",
          "Earlier mornings",
          "Later mornings",
          "Fewer meetings",
          "More deep work",
          "More social time",
          "More outdoors"
        ],
        placeholder: "Something you want to improve",
        maxWords: 100
      },
      {
        id: 10,
        section: 'current-situation',
        prompt: "How do you feel about your current financial situation?",
        type: 'choice',
        options: [
          "Comfortable",
          "Stable but cautious",
          "Making it work",
          "Tight right now",
          "Feast or famine",
          "Building wealth era",
          "Debt snowballing",
          "Prefer not to say"
        ],
        placeholder: "Your financial comfort level",
        maxWords: 100
      },
      {
        id: 11,
        section: 'current-situation',
        prompt: "What's one financial goal you're working toward?",
        type: 'choice',
        options: [
          "Emergency fund",
          "Pay off debt",
          "Save for big purchase",
          "Invest regularly",
          "Salary increase",
          "Build side income",
          "Start a business",
          "F-U money",
          "Travel fund",
          "Education fund"
        ],
        placeholder: "A money-related objective",
        maxWords: 100
      },
      {
        id: 12,
        section: 'current-situation',
        prompt: "Who are the people you spend the most time with?",
        type: 'choice',
        options: [
          "Coworkers",
          "Family",
          "Partner",
          "Friends",
          "Roommates",
          "Pets (they count)",
          "Online communities",
          "Clients/Customers",
          "Classmates",
          "Myself tbh"
        ],
        placeholder: "Your inner circle",
        maxWords: 100
      },
      {
        id: 13,
        section: 'current-situation',
        prompt: "How do you feel about your current relationships?",
        type: 'choice',
        options: [
          "Supportive",
          "Complicated",
          "Drifting",
          "Strong and growing",
          "Need new circles",
          "Could communicate better",
          "Lonely lately",
          "Energizing",
          "Draining"
        ],
        placeholder: "Your social connections",
        maxWords: 100
      },
      {
        id: 14,
        section: 'current-situation',
        prompt: "What's one value you prioritize the most in your life right now?",
        type: 'choice',
        options: [
          "Freedom",
          "Stability",
          "Growth",
          "Creativity",
          "Community",
          "Learning",
          "Health",
          "Integrity",
          "Adventure",
          "Impact"
        ],
        placeholder: "Your core value",
        maxWords: 100
      },
      {
        id: 15,
        section: 'current-situation',
        prompt: "What's one fear you feel is holding you back today?",
        type: 'choice',
        options: [
          "Failure",
          "Rejection",
          "Not enough time",
          "Financial risk",
          "Looking silly",
          "Starting over",
          "Success (and pressure)",
          "Letting others down",
          "The unknown"
        ],
        placeholder: "Something that worries you",
        maxWords: 100
      },
      {
        id: 16,
        section: 'current-situation',
        prompt: "How do you usually spend your free time?",
        type: 'choice',
        options: [
          "Reading",
          "Gaming",
          "Gym/Fitness",
          "Cooking",
          "Creating content",
          "Music",
          "Outdoors",
          "Volunteering",
          "Family time",
          "Doomscrolling"
        ],
        placeholder: "Your leisure activities",
        maxWords: 100
      },
      {
        id: 17,
        section: 'current-situation',
        prompt: "What's one professional goal you're working toward?",
        type: 'choice',
        options: [
          "Promotion",
          "Career pivot",
          "Build portfolio",
          "Certification",
          "New job",
          "Salary bump",
          "Leadership role",
          "Publish work",
          "Speak at an event",
          "Start side project"
        ],
        placeholder: "A career objective",
        maxWords: 100
      },
      {
        id: 18,
        section: 'current-situation',
        prompt: "How do you feel about your current industry or field?",
        type: 'choice',
        options: [
          "Love it",
          "It's fine",
          "Mixed feelings",
          "Over it",
          "Switching soon",
          "New here",
          "Lots of potential",
          "Uncertain future"
        ],
        placeholder: "Your thoughts on your sector",
        maxWords: 100
      },
      {
        id: 19,
        section: 'current-situation',
        prompt: "What's the biggest financial challenge you're facing right now?",
        type: 'choice',
        options: [
          "High cost of living",
          "Debt",
          "Income variability",
          "Low salary",
          "Unexpected expenses",
          "Savings discipline",
          "Budgeting",
          "Healthcare costs",
          "Family obligations"
        ],
        placeholder: "Money-related difficulties",
        maxWords: 100
      },
      {
        id: 20,
        section: 'current-situation',
        prompt: "How connected do you feel to your community?",
        type: 'choice',
        options: [
          "Very connected",
          "Somewhat",
          "Not much",
          "Online-only vibes",
          "Building community",
          "New to area",
          "Prefer lone wolf",
          "Actively involved"
        ],
        placeholder: "Your sense of belonging",
        maxWords: 100
      },
      // Future Aspirations (20 questions)
      {
        id: 21,
        section: 'future-aspirations',
        prompt: "What's your dream job?",
        type: 'choice',
        options: [
          "Product Manager",
          "UX/UI Designer",
          "Software Engineer",
          "Data Scientist",
          "Founder/CEO",
          "Creative Director",
          "Researcher",
          "Content Creator",
          "Educator/Mentor",
          "Operations/COO vibes",
          "Something remote with impact"
        ],
        placeholder: "Your ideal role",
        maxWords: 100
      },
      {
        id: 22,
        section: 'future-aspirations',
        prompt: "What's the biggest dream you've ever had?",
        type: 'choice',
        options: [
          "Build something millions use",
          "Financial freedom",
          "Make art that moves people",
          "Start a mission-driven company",
          "Travel the world sustainably",
          "Lead a world-class team",
          "Publish a book",
          "Teach at scale",
          "Work on climate solutions",
          "Raise a happy healthy family",
          "Live slow and present"
        ],
        placeholder: "Your grandest aspiration",
        maxWords: 100
      },
      {
        id: 23,
        section: 'future-aspirations',
        prompt: "What's one skill you want to build for your career?",
        type: 'choice',
        options: [
          "Leadership",
          "Coding/Automation",
          "Design/UI",
          "Data/AI",
          "Public speaking",
          "Writing/Storytelling",
          "Sales/Influence",
          "Strategy",
          "Networking",
          "Project management"
        ],
        placeholder: "A skill to develop",
        maxWords: 100
      },
      {
        id: 24,
        section: 'future-aspirations',
        prompt: "What impact do you want to have on the world?",
        type: 'choice',
        options: [
          "Empower others",
          "Climate action",
          "Health & wellbeing",
          "Education access",
          "Economic opportunity",
          "Ethical tech",
          "Creative joy",
          "Community building",
          "Reduce inequality",
          "Build open-source"
        ],
        placeholder: "Your desired contribution",
        maxWords: 100
      },
      {
        id: 25,
        section: 'future-aspirations',
        prompt: "If you could create your own job, what would it look like?",
        type: 'choice',
        options: [
          "Hybrid creator-engineer",
          "Research ↔ product bridge",
          "Strategy + execution lead",
          "Customer-obsessed builder",
          "Solo indie hacker",
          "Community-led PM",
          "Remote-first team lead",
          "R&D explorer",
          "Problem-solver-for-hire",
          "Creator-educator"
        ],
        placeholder: "Design your perfect role",
        maxWords: 100
      },
      {
        id: 26,
        section: 'future-aspirations',
        prompt: "What's a problem in the world you'd love to solve?",
        type: 'choice',
        options: [
          "Misinformation",
          "Loneliness",
          "Climate change",
          "Access to healthcare",
          "Education equity",
          "Financial literacy",
          "Fraud/scams",
          "Waste/plastic",
          "Accessibility",
          "Broken hiring"
        ],
        placeholder: "An issue you care about",
        maxWords: 100
      },
      {
        id: 27,
        section: 'future-aspirations',
        prompt: "What industry excites you the most right now?",
        type: 'choice',
        options: [
          "AI/ML",
          "Climate tech",
          "Health tech",
          "EdTech",
          "Creator economy",
          "Gaming/AR",
          "Fintech",
          "Cybersecurity",
          "Space tech",
          "Civic/Gov tech"
        ],
        placeholder: "A field that interests you",
        maxWords: 100
      },
      {
        id: 28,
        section: 'future-aspirations',
        prompt: "What's one accomplishment that would make you feel fulfilled?",
        type: 'choice',
        options: [
          "Launch a product end-to-end",
          "Lead a team",
          "Hit 10k active users",
          "Reach six-figure revenue",
          "Win an industry award",
          "Speak at a conference",
          "Open-source contributions",
          "Publish research/patent",
          "Mentor others",
          "Consistent work-life balance"
        ],
        placeholder: "A meaningful achievement",
        maxWords: 100
      },
      {
        id: 29,
        section: 'future-aspirations',
        prompt: "Where do you want to live in 10 years?",
        type: 'choice',
        options: [
          "Same city, happily",
          "Different city, same country",
          "International move",
          "Coastal city",
          "Mountain town",
          "Suburbs with space",
          "Rural homestead",
          "Digital nomad base",
          "Close to family",
          "Wherever opportunity is"
        ],
        placeholder: "Your ideal location",
        maxWords: 100
      },
      {
        id: 30,
        section: 'future-aspirations',
        prompt: "What's your ideal daily routine?",
        type: 'choice',
        options: [
          "Deep work mornings",
          "Meetings after lunch",
          "Gym midday",
          "Walk + podcasts",
          "Focus sprints",
          "Creative blocks",
          "No commute",
          "Asynchronous schedule",
          "4-day week",
          "Start late, end late"
        ],
        placeholder: "Your perfect day",
        maxWords: 100
      },
      {
        id: 31,
        section: 'future-aspirations',
        prompt: "What kind of work-life balance would make you happiest?",
        type: 'choice',
        options: [
          "Strict 9–5",
          "Flexible hours",
          "Remote first",
          "Hybrid",
          "On-site and social",
          "Project-based bursts",
          "Seasonality-based",
          "Part-time excellence",
          "Sabbatical cycles",
          "Work to live energy"
        ],
        placeholder: "Your ideal balance",
        maxWords: 100
      },
      {
        id: 32,
        section: 'future-aspirations',
        prompt: "What's one value you'll never compromise on?",
        type: 'choice',
        options: [
          "Integrity",
          "Kindness",
          "Curiosity",
          "Autonomy",
          "Craftsmanship",
          "Transparency",
          "Sustainability",
          "Inclusion",
          "Family",
          "Health"
        ],
        placeholder: "Your non-negotiable",
        maxWords: 100
      },
      {
        id: 33,
        section: 'future-aspirations',
        prompt: "What kind of person do you want to be in 10 years?",
        type: 'choice',
        options: [
          "Calm and confident",
          "Creative leader",
          "Reliable builder",
          "Impact-driven human",
          "Curious lifelong learner",
          "Healthy & present",
          "Community connector",
          "Wealth-wise & generous",
          "Bold but kind",
          "Zen operator"
        ],
        placeholder: "Your future self",
        maxWords: 100
      },
      {
        id: 34,
        section: 'future-aspirations',
        prompt: "What's one thing about yourself you're most proud of?",
        type: 'choice',
        options: [
          "Resilience",
          "Empathy",
          "Humor under pressure",
          "Work ethic",
          "Adaptability",
          "Creativity",
          "Curiosity",
          "Patience",
          "Leadership potential",
          "Disciplined habits"
        ],
        placeholder: "Your pride point",
        maxWords: 100
      },
      {
        id: 35,
        section: 'future-aspirations',
        prompt: "What's an activity you can do for hours without getting bored?",
        type: 'choice',
        options: [
          "Coding/Building",
          "Designing",
          "Writing",
          "Reading/Research",
          "Teaching/Tutoring",
          "Strategy puzzles",
          "Music/Creating",
          "Analytics dashboards",
          "Prototyping",
          "Community modding"
        ],
        placeholder: "Your flow activity",
        maxWords: 100
      },
      {
        id: 36,
        section: 'future-aspirations',
        prompt: "What's one topic you'd love to learn more about?",
        type: 'choice',
        options: [
          "AI/LLMs",
          "Climate science",
          "Behavioral psychology",
          "Finance/Investing",
          "Product strategy",
          "UX research",
          "Systems design",
          "Public speaking",
          "Negotiation",
          "Data engineering"
        ],
        placeholder: "Something to explore",
        maxWords: 100
      },
      {
        id: 37,
        section: 'future-aspirations',
        prompt: "If you could turn a hobby into a career, what would it be?",
        type: 'choice',
        options: [
          "Photography",
          "Gaming/Streaming",
          "Writing/Blogging",
          "Cooking/Baking",
          "Fitness coaching",
          "Music production",
          "Gardening",
          "DIY/Making",
          "Travel content",
          "Language learning"
        ],
        placeholder: "Monetizing your passion",
        maxWords: 100
      },
      {
        id: 38,
        section: 'future-aspirations',
        prompt: "What unique contribution do you want to make?",
        type: 'choice',
        options: [
          "Bridge tech and people",
          "Simplify complexity",
          "Create delightful experiences",
          "Ship reliable systems",
          "Mentor early-career folks",
          "Build ethical products",
          "Community catalyst",
          "Bring comic relief",
          "Strong operator energy",
          "Long-term thinking"
        ],
        placeholder: "Your special offering",
        maxWords: 100
      },
      {
        id: 39,
        section: 'future-aspirations',
        prompt: "What does financial success mean to you?",
        type: 'choice',
        options: [
          "Freedom of time",
          "No debt, solid savings",
          "Comfortable lifestyle",
          "Taking care of family",
          "Work optional vibes",
          "Giving generously",
          "Owning real assets",
          "Location independence",
          "Career flexibility",
          "Build wealth slowly"
        ],
        placeholder: "Your money mindset",
        maxWords: 100
      },
      {
        id: 40,
        section: 'future-aspirations',
        prompt: "Who's living a life you admire, and why?",
        type: 'choice',
        options: [
          "Parent/Family member",
          "Teacher/Mentor",
          "Founder I admire",
          "Scientist/Engineer",
          "Artist/Creator",
          "Community leader",
          "Athlete/Coach",
          "Writer/Journalist",
          "Public servant",
          "Historical figure"
        ],
        placeholder: "Your role model",
        maxWords: 100
      },
    ]
  },

  'deep-dive': {
    id: 'deep-dive',
    name: 'The Deep Dive',
    description: 'Comprehensive career exploration. Thorough goal and situation assessment.',
    totalQuestions: 100,
    estimatedTime: '45-60 minutes',
    features: ['Complete career analysis', '5-year roadmap', 'Skill development plan', 'Industry transition guide', 'Financial planning'],
    sections: [
      {
        id: 'identity-values',
        title: 'Current Identity & Values',
        description: 'Understanding who you are today',
        icon: '🧭',
        questions: []
      },
      {
        id: 'career-skills',
        title: 'Current Career & Skills',
        description: 'Your professional landscape',
        icon: '💼',
        questions: []
      },
      {
        id: 'lifestyle-finances',
        title: 'Current Lifestyle & Finances',
        description: 'How you live and manage resources',
        icon: '💰',
        questions: []
      },
      {
        id: 'dreams-aspirations',
        title: 'Future Dreams & Aspirations',
        description: 'Where you want to be',
        icon: '🚀',
        questions: []
      },
      {
        id: 'action-steps',
        title: 'Action Steps & Implementation',
        description: 'Making it happen',
        icon: '📋',
        questions: []
      }
    ],
    questions: [
      // Current Identity & Values (20 questions)
      {
        id: 1,
        section: 'identity-values',
        prompt: "What's your current job or role in life?",
        type: 'choice',
        options: [
          "Student",
          "Full-time employee",
          "Part-time",
          "Freelancer/Contractor",
          "Entrepreneur",
          "Career break / Between gigs",
          "Parent/Caregiver",
          "Still figuring it out (vibes)"
        ],
        placeholder: "Your current position",
        maxWords: 100
      },
      {
        id: 2,
        section: 'identity-values',
        prompt: "How would you describe yourself in one sentence today?",
        type: 'choice',
        options: [
          "Focused",
          "Curious",
          "Ambitious",
          "Overcaffeinated but optimistic",
          "Calm and consistent",
          "Figuring it out",
          "Burnt-out but hopeful",
          "Chaotically productive"
        ],
        placeholder: "Brief self-description",
        maxWords: 100
      },
      {
        id: 3,
        section: 'identity-values',
        prompt: "What's one value you prioritize most in your life right now?",
        type: 'choice',
        options: [
          "Freedom",
          "Stability",
          "Growth",
          "Family",
          "Health",
          "Creativity",
          "Community",
          "Integrity"
        ],
        placeholder: "Your core value",
        maxWords: 100
      },
      {
        id: 4,
        section: 'identity-values',
        prompt: "What's one thing about yourself you feel confident in?",
        type: 'choice',
        options: [
          "Communication",
          "Problem-solving",
          "Learning fast",
          "Organization",
          "Empathy",
          "Creativity",
          "Staying calm under pressure",
          "Making spot-on memes"
        ],
        placeholder: "Your strength",
        maxWords: 100
      },
      {
        id: 5,
        section: 'identity-values',
        prompt: "What's one fear you feel is holding you back today?",
        type: 'choice',
        options: [
          "Failure",
          "Rejection",
          "Making the wrong choice",
          "Not being good enough",
          "Wasting time",
          "Financial risk",
          "Running out of snacks mid-project"
        ],
        placeholder: "Your concern",
        maxWords: 100
      },
      {
        id: 6,
        section: 'identity-values',
        prompt: "How do you usually spend your free time?",
        type: 'choice',
        options: [
          "Reading",
          "Gaming",
          "Gym/Fitness",
          "Cooking/Baking",
          "Outdoors/Travel",
          "Side projects",
          "Friends/Family time",
          "Napping like a pro"
        ],
        placeholder: "Leisure activities",
        maxWords: 100
      },
      {
        id: 7,
        section: 'identity-values',
        prompt: "What's one word to describe your current mindset?",
        type: 'choice',
        options: [
          "Focused",
          "Curious",
          "Determined",
          "Overwhelmed",
          "Hopeful",
          "Stuck",
          "Playful",
          "Resilient"
        ],
        placeholder: "Single word",
        maxWords: 100
      },
      {
        id: 8,
        section: 'identity-values',
        prompt: "What's one belief about yourself that you're questioning?",
        type: 'choice',
        options: [
          "I must have it all figured out",
          "I'm not creative",
          "I'm not technical",
          "I'm behind",
          "I can't switch careers",
          "I need permission to start",
          "I'm bad at networking",
          "None of the above"
        ],
        placeholder: "Self-doubt area",
        maxWords: 100
      },
      {
        id: 9,
        section: 'identity-values',
        prompt: "What's something you've recently accomplished that you're proud of?",
        type: 'choice',
        options: [
          "Learned a new skill",
          "Shipped a project",
          "Asked for help",
          "Presented to a group",
          "Started a healthy habit",
          "Updated my resume/portfolio",
          "Took a break without guilt",
          "Other"
        ],
        placeholder: "Recent achievement",
        maxWords: 100
      },
      {
        id: 10,
        section: 'identity-values',
        prompt: "What's one habit you wish you could change?",
        type: 'choice',
        options: [
          "Procrastination",
          "Doomscrolling",
          "Multitasking",
          "Overcommitting",
          "Perfectionism",
          "Late nights",
          "Skipping exercise",
          "Saying yes to every meeting"
        ],
        placeholder: "Habit to improve",
        maxWords: 100
      },
      {
        id: 11,
        section: 'identity-values',
        prompt: "What motivates you the most right now?",
        type: 'choice',
        options: [
          "Impact",
          "Learning/Growth",
          "Money (no shame)",
          "Recognition",
          "Autonomy",
          "Stability",
          "Fun/Curiosity",
          "Helping others"
        ],
        placeholder: "Your driver",
        maxWords: 100
      },
      {
        id: 12,
        section: 'identity-values',
        prompt: "What's one word that describes the life you want?",
        type: 'choice',
        options: [
          "Balanced",
          "Creative",
          "Purposeful",
          "Free",
          "Abundant",
          "Adventurous",
          "Calm",
          "Impactful"
        ],
        placeholder: "Future vision word",
        maxWords: 100
      },
      {
        id: 13,
        section: 'identity-values',
        prompt: "What's your biggest strength?",
        type: 'choice',
        options: [
          "Communication",
          "Adaptability",
          "Resilience",
          "Creativity",
          "Analytical thinking",
          "Empathy",
          "Leadership",
          "Humor"
        ],
        placeholder: "Top ability",
        maxWords: 100
      },
      {
        id: 14,
        section: 'identity-values',
        prompt: "What's your biggest weakness?",
        type: 'choice',
        options: [
          "Perfectionism",
          "Procrastination",
          "Self-doubt",
          "Impatience",
          "Saying yes too often",
          "Overthinking",
          "Avoiding conflict",
          "Time management"
        ],
        placeholder: "Area to improve",
        maxWords: 100
      },
      {
        id: 15,
        section: 'identity-values',
        prompt: "What makes you unique?",
        type: 'choice',
        options: [
          "Multidisciplinary background",
          "Unusual combo of skills",
          "Quick learner",
          "People connector",
          "Detail-oriented",
          "Big-picture thinker",
          "Calm under pressure",
          "Spreadsheet artist"
        ],
        placeholder: "Your differentiator",
        maxWords: 100
      },
      {
        id: 16,
        section: 'identity-values',
        prompt: "What's one thing you'd never compromise on?",
        type: 'choice',
        options: [
          "Integrity",
          "Health",
          "Family",
          "Learning",
          "Respect",
          "Boundaries",
          "Creativity",
          "Well-being"
        ],
        placeholder: "Non-negotiable",
        maxWords: 100
      },
      {
        id: 17,
        section: 'identity-values',
        prompt: "What's your personal definition of success?",
        type: 'choice',
        options: [
          "Freedom over my time",
          "Meaningful impact",
          "Growth and learning",
          "Financial security",
          "Work I enjoy",
          "Helping others",
          "Balance and health",
          "Recognition for my craft"
        ],
        placeholder: "Success means...",
        maxWords: 100
      },
      {
        id: 18,
        section: 'identity-values',
        prompt: "What's one thing you wish others knew about you?",
        type: 'choice',
        options: [
          "I'm introverted (not shy)",
          "I think deeply before speaking",
          "I care a lot",
          "I'm more technical than I seem",
          "I'm more creative than I seem",
          "I have big ambitions",
          "I need quiet time to do my best",
          "Other"
        ],
        placeholder: "Hidden aspect",
        maxWords: 100
      },
      {
        id: 19,
        section: 'identity-values',
        prompt: "What's one life experience that shaped who you are?",
        type: 'choice',
        options: [
          "Immigrating or moving",
          "Changing careers",
          "Starting a business",
          "Caring for family",
          "Overcoming failure",
          "A great mentor/teacher",
          "Traveling solo",
          "Working through burnout"
        ],
        placeholder: "Formative experience",
        maxWords: 100
      },
      {
        id: 20,
        section: 'identity-values',
        prompt: "What's one thing you're currently struggling with?",
        type: 'choice',
        options: [
          "Clarity/direction",
          "Motivation",
          "Time management",
          "Confidence",
          "Work-life balance",
          "Finances",
          "Health/Energy",
          "Saying no"
        ],
        placeholder: "Current challenge",
        maxWords: 100
      },
      // Current Career & Skills (20 questions) - ids 21-40
      {
        id: 21,
        section: 'career-skills',
        prompt: "What skills do you use most often in your work?",
        type: 'choice',
        options: [
          "Communicating with humans (and Slack)",
          "Problem-solving on hard mode",
          "Data wrangling and spreadsheet wizardry",
          "Design and visual storytelling",
          "Coding/automation to de-boring the boring",
          "Herding cats (aka project management)",
          "Research and deep dives",
          "Writing clear docs and messages"
        ],
        placeholder: "Frequently used skills",
        maxWords: 100
      },
      {
        id: 22,
        section: 'career-skills',
        prompt: "What's one skill you feel particularly confident in?",
        type: 'choice',
        options: [
          "Explaining tough stuff simply",
          "Turning chaos into a plan",
          "Design eye so sharp it cuts",
          "Coding without crying",
          "Numbers, dashboards, and data vibes",
          "Writing that people actually read",
          "People skills (yes, including boundaries)",
          "Creative problem solving on speedrun mode"
        ],
        placeholder: "Strong skill",
        maxWords: 100
      },
      {
        id: 23,
        section: 'career-skills',
        prompt: "What's one skill you'd like to improve?",
        type: 'choice',
        options: [
          "Public speaking without stage fright",
          "Saying no without a 10-slide presentation",
          "Deep focus (bye, endless tabs)",
          "Advanced data/analysis skills",
          "System design/architecture",
          "Leadership and delegation",
          "Creative storytelling",
          "Time management that actually sticks"
        ],
        placeholder: "Skill gap",
        maxWords: 100
      },
      {
        id: 24,
        section: 'career-skills',
        prompt: "How satisfied are you with your current career path? (1-10)",
        type: 'scale',
        placeholder: "1-10 rating",
        maxWords: 100
      },
      {
        id: 25,
        section: 'career-skills',
        prompt: "What's one thing you've learned on the job recently?",
        type: 'choice',
        options: [
          "A new tool/stack that slaps",
          "Shortcuts that saved me hours",
          "Ask for help sooner, future me says thanks",
          "Write it down or repeat it forever",
          "Automate the boring stuff",
          "Meetings need an agenda or it's an email",
          "Scope creep is real — defend the roadmap",
          "Other (plot twist)"
        ],
        placeholder: "Recent learning",
        maxWords: 100
      },
      {
        id: 26,
        section: 'career-skills',
        prompt: "What's a challenge you're facing in your work right now?",
        type: 'choice',
        options: [
          "Too many priorities, not enough time",
          "Unclear requirements/moving targets",
          "Context switching gymnastic routine",
          "Perfectionism vs. deadlines",
          "Stakeholder chaos (send help)",
          "Legacy code archaeology",
          "Analysis paralysis",
          "Burnout pings are blinking"
        ],
        placeholder: "Work obstacle",
        maxWords: 100
      },
      {
        id: 27,
        section: 'career-skills',
        prompt: "What's one professional goal you're working toward?",
        type: 'choice',
        options: [
          "Lead a project end-to-end",
          "Earn a promotion/title change",
          "Switch roles/industries",
          "Build a portfolio/showcase",
          "Get better at public speaking",
          "Earn a certification",
          "Improve work-life balance",
          "Mentor or be mentored"
        ],
        placeholder: "Career goal",
        maxWords: 100
      },
      {
        id: 28,
        section: 'career-skills',
        prompt: "How do you feel about your current industry or field?",
        type: 'choice',
        options: [
          "Evolving fast — keeps me hyped",
          "Stable but kinda sleepy",
          "Innovative but chaotic energy",
          "Mid vibes — browsing exits",
          "Mission-driven and I love it",
          "Tiring, considering a switch",
          "Booming — opportunity everywhere",
          "Gatekeep-y and I notice"
        ],
        placeholder: "Industry thoughts",
        maxWords: 100
      },
      {
        id: 29,
        section: 'career-skills',
        prompt: "What's one thing you wish was different about your current job?",
        type: 'choice',
        options: [
          "More flexibility/remote options",
          "Better pay (respectfully)",
          "Fewer meetings that could be emails",
          "More creative/impactful work",
          "Clearer roadmap and priorities",
          "Supportive, present management",
          "Learning budget/time",
          "Smaller team, fewer politics"
        ],
        placeholder: "Job improvement",
        maxWords: 100
      },
      {
        id: 30,
        section: 'career-skills',
        prompt: "What's your favorite part of your current work?",
        type: 'choice',
        options: [
          "Building things that work",
          "Solving brain-twisty problems",
          "Collaborating with the team",
          "Helping users/customers win",
          "Creative freedom to experiment",
          "Learning new tech/skills",
          "Autonomy and ownership",
          "That end-of-sprint dopamine rush"
        ],
        placeholder: "Best aspect",
        maxWords: 100
      },
      {
        id: 31,
        section: 'career-skills',
        prompt: "What's your least favorite part of your current work?",
        type: 'choice',
        options: [
          "Meetings with no agenda",
          "Scope creep strikes again",
          "Last-minute fire drills",
          "Repetitive tasks (copy/paste life)",
          "Office politics",
          "Unclear feedback",
          "Constant context switching",
          "Outdated tools that fight back"
        ],
        placeholder: "Worst aspect",
        maxWords: 100
      },
      {
        id: 32,
        section: 'career-skills',
        prompt: "How do you handle work-related stress?",
        type: 'choice',
        options: [
          "Walks + water + sunlight",
          "Gym/run it off",
          "Vent to a trusted friend",
          "Prioritize + make a plan",
          "Microbreaks and deep breaths",
          "Music/lofi beats",
          "Therapy/meditation",
          "Boundaries: log off, actually"
        ],
        placeholder: "Stress management",
        maxWords: 100
      },
      {
        id: 33,
        section: 'career-skills',
        prompt: "What's your preferred working style?",
        type: 'choice',
        options: [
          "Deep focus, minimal interruptions",
          "Pairing/collaboration heavy",
          "Async-first and documented",
          "Fast iteration, quick feedback",
          "Process-driven and organized",
          "Research-first then build",
          "Design-first and prototyping",
          "Data-driven decisions"
        ],
        placeholder: "Work preferences",
        maxWords: 100
      },
      {
        id: 34,
        section: 'career-skills',
        prompt: "How do you like to learn new things?",
        type: 'choice',
        options: [
          "Hands-on: build and break stuff",
          "Video courses/YouTube/Udemy",
          "Docs + source code explorer",
          "Mentorship/shadowing",
          "Podcasts/blogs and notes",
          "Workshops/bootcamps",
          "Books and deep dives",
          "Trial-and-error speedrun"
        ],
        placeholder: "Learning style",
        maxWords: 100
      },
      {
        id: 35,
        section: 'career-skills',
        prompt: "What's one professional relationship you'd like to improve?",
        type: 'choice',
        options: [
          "Manager",
          "Mentor",
          "Peer/teammate",
          "Cross-functional partner",
          "Stakeholder",
          "Client/customer",
          "Community/network",
          "Direct report"
        ],
        placeholder: "Relationship to enhance",
        maxWords: 100
      },
      {
        id: 36,
        section: 'career-skills',
        prompt: "What's one work achievement you're proud of?",
        type: 'choice',
        options: [
          "Shipped a big feature/launch",
          "Moved a key KPI/metric",
          "Automated a time sink",
          "Led an important project",
          "Resolved a major incident",
          "Improved a broken process",
          "Presented to leadership",
          "Mentored/onboarded someone"
        ],
        placeholder: "Career highlight",
        maxWords: 100
      },
      {
        id: 37,
        section: 'career-skills',
        prompt: "What's one work-related decision you regret?",
        type: 'choice',
        options: [
          "Saying yes to everything",
          "Not negotiating pay",
          "Delaying a tough conversation",
          "Overengineering the solution",
          "Leaving too soon",
          "Staying too long",
          "Skipping documentation",
          "Ignoring red flags"
        ],
        placeholder: "Career regret",
        maxWords: 100
      },
      {
        id: 38,
        section: 'career-skills',
        prompt: "How do you measure success in your current role?",
        type: 'choice',
        options: [
          "Impact on users/customers",
          "KPIs/metrics actually moved",
          "Quality/craft of work",
          "Learning and growth",
          "Team health/collaboration",
          "Shipping velocity",
          "Revenue/ROI",
          "Recognition/promotion"
        ],
        placeholder: "Success metrics",
        maxWords: 100
      },
      {
        id: 39,
        section: 'career-skills',
        prompt: "What's one thing you'd change about your work environment?",
        type: 'choice',
        options: [
          "More quiet focus time",
          "Fewer interruptions/pings",
          "Clearer communication",
          "Better tools/dev setup",
          "Flexible hours",
          "More remote days",
          "Healthier team culture",
          "Nicer physical workspace"
        ],
        placeholder: "Environment change",
        maxWords: 100
      },
      {
        id: 40,
        section: 'career-skills',
        prompt: "What's one professional opportunity you wish you had?",
        type: 'choice',
        options: [
          "Work abroad/anywhere remote",
          "Lead a team/initiative",
          "High-impact flagship project",
          "Conference speaking/teaching",
          "Stretch role/rotation",
          "Mentorship program",
          "Learning budget/time",
          "Build 0→1 from scratch"
        ],
        placeholder: "Desired opportunity",
        maxWords: 100
      },
      // Current Lifestyle & Finances (20 questions) - ids 41-60
      {
        id: 41,
        section: 'lifestyle-finances',
        prompt: "Where do you live, and how do you feel about it?",
        type: 'choice',
        options: [
          "Big city — love the energy",
          "Big city — too loud/expensive",
          "Suburbs — peaceful but commute",
          "Small town — cozy/community",
          "Remote/rural — nature core",
          "Moving soon — in limbo",
          "Digital nomad era",
          "With family/roommates — it's fine"
        ],
        placeholder: "Location and feelings",
        maxWords: 100
      },
      {
        id: 42,
        section: 'lifestyle-finances',
        prompt: "What does your daily routine usually look like?",
        type: 'choice',
        options: [
          "Structured 9–5 schedule",
          "Flexible, task-first",
          "Meetings all day",
          "Maker schedule (deep work blocks)",
          "Night owl productive",
          "Early bird energy",
          "Juggling school/work/life",
          "Routine? We don't know her"
        ],
        placeholder: "Typical day",
        maxWords: 100
      },
      {
        id: 43,
        section: 'lifestyle-finances',
        prompt: "How do you spend your weekends?",
        type: 'choice',
        options: [
          "Recharge: sleep/read",
          "Outside: hikes/sports",
          "Social: friends/family",
          "Creative projects",
          "Side hustle/building",
          "Travel/explore",
          "Gaming/movies",
          "Chores + reset"
        ],
        placeholder: "Weekend activities",
        maxWords: 100
      },
      {
        id: 44,
        section: 'lifestyle-finances',
        prompt: "What's your current work-life balance like?",
        type: 'choice',
        options: [
          "Great — healthy boundaries",
          "Pretty good — most days",
          "Mid — could be better",
          "Not great — always on",
          "Burnout lite",
          "Depends on the sprint",
          "Improving recently",
          "New job who dis"
        ],
        placeholder: "Balance assessment",
        maxWords: 100
      },
      {
        id: 45,
        section: 'lifestyle-finances',
        prompt: "How do you feel about your current financial situation?",
        type: 'choice',
        options: [
          "Comfortable and stable",
          "Doing okay, watching budget",
          "Tight but manageable",
          "Paycheck to paycheck",
          "In debt and tackling it",
          "Saving aggressively",
          "Investing regularly",
          "Building emergency fund"
        ],
        placeholder: "Financial comfort",
        maxWords: 100
      },
      {
        id: 46,
        section: 'lifestyle-finances',
        prompt: "What's one financial goal you're working toward?",
        type: 'choice',
        options: [
          "Pay off debt",
          "Build emergency fund",
          "Save for a big purchase",
          "Increase income",
          "Start investing",
          "Budget better/track spending",
          "Build multiple income streams",
          "Negotiate salary"
        ],
        placeholder: "Money goal",
        maxWords: 100
      },
      {
        id: 47,
        section: 'lifestyle-finances',
        prompt: "What's the biggest financial challenge you're facing?",
        type: 'choice',
        options: [
          "Income too low",
          "High expenses (rent, etc.)",
          "Debt payments",
          "Impulse spending",
          "Inconsistent income",
          "Unexpected bills",
          "No budget system",
          "Financial literacy gap"
        ],
        placeholder: "Money challenge",
        maxWords: 100
      },
      {
        id: 48,
        section: 'lifestyle-finances',
        prompt: "How do you usually make decisions about money?",
        type: 'choice',
        options: [
          "Budgeted, plan-first",
          "50/30/20 or similar method",
          "Spreadsheet/app tracking",
          "Vibes + 'do I need this?'",
          "Ask a trusted friend/advisor",
          "Research then decide",
          "Auto-pay/auto-save everything",
          "YOLO then reflect (improving)"
        ],
        placeholder: "Financial decision process",
        maxWords: 100
      },
      {
        id: 49,
        section: 'lifestyle-finances',
        prompt: "What's one purchase you've made recently that you regret?",
        type: 'choice',
        options: [
          "Subscription I forgot to cancel",
          "Trendy gadget collecting dust",
          "Expensive meal/takeout spree",
          "Impulse fashion haul",
          "Overhyped course",
          "In-app microtransactions",
          "Gym membership unused",
          "Plane tickets I didn't use"
        ],
        placeholder: "Regretted purchase",
        maxWords: 100
      },
      {
        id: 50,
        section: 'lifestyle-finances',
        prompt: "What's one thing you wish you could afford right now?",
        type: 'choice',
        options: [
          "Travel/flight",
          "New laptop/phone",
          "Own place/nicer apartment",
          "Car/transport upgrade",
          "Education/course/cert",
          "Home office setup",
          "Debt-free peace",
          "Time off/vacation"
        ],
        placeholder: "Desired purchase",
        maxWords: 100
      },
      {
        id: 51,
        section: 'lifestyle-finances',
        prompt: "How do you feel about your ability to manage money?",
        type: 'choice',
        options: [
          "Strong budgeting skills",
          "Pretty good, could tighten",
          "Learning the ropes",
          "Needs structure/tools",
          "I wing it too much",
          "Partner/parent helps",
          "Getting coaching/help",
          "Working on consistency"
        ],
        placeholder: "Money management skills",
        maxWords: 100
      },
      {
        id: 52,
        section: 'lifestyle-finances',
        prompt: "What's your relationship with saving and spending?",
        type: 'choice',
        options: [
          "Saver by default",
          "Balanced spender/saver",
          "Treat myself then save",
          "Frugal minimalism era",
          "Spender trying to reform",
          "Save for goals only",
          "Spend on experiences",
          "Cash-stuffing envelope arc"
        ],
        placeholder: "Financial habits",
        maxWords: 100
      },
      {
        id: 53,
        section: 'lifestyle-finances',
        prompt: "How do you feel about your current living space?",
        type: 'choice',
        options: [
          "Love it — cozy and functional",
          "Decent but small",
          "Great location, meh space",
          "Affordable but bland",
          "Roommates make it lively",
          "Needs declutter/upgrade",
          "Too noisy for focus",
          "Moving soon"
        ],
        placeholder: "Home satisfaction",
        maxWords: 100
      },
      {
        id: 54,
        section: 'lifestyle-finances',
        prompt: "What's one thing you'd change about your lifestyle?",
        type: 'choice',
        options: [
          "More sleep and recovery",
          "Better nutrition/cooking",
          "Consistent exercise",
          "Less screen time",
          "More social time",
          "Earlier mornings",
          "More creative time",
          "Cleaner/organized space"
        ],
        placeholder: "Lifestyle improvement",
        maxWords: 100
      },
      {
        id: 55,
        section: 'lifestyle-finances',
        prompt: "How do you typically handle stress?",
        type: 'choice',
        options: [
          "Exercise/sweat it out",
          "Journaling/meditation",
          "Talk it out/therapy",
          "Plan + prioritize",
          "Take microbreaks",
          "Boundaries + log off",
          "Creative outlet",
          "Nature time"
        ],
        placeholder: "Stress coping",
        maxWords: 100
      },
      {
        id: 56,
        section: 'lifestyle-finances',
        prompt: "What's your relationship with health and wellness?",
        type: 'choice',
        options: [
          "Gym era",
          "Functional movement daily",
          "Mindfulness/mental health first",
          "Balanced and flexible",
          "On/off cycles",
          "Learning healthy habits",
          "Recovering from burnout",
          "Need guidance/accountability"
        ],
        placeholder: "Health habits",
        maxWords: 100
      },
      {
        id: 57,
        section: 'lifestyle-finances',
        prompt: "How do you spend your free time?",
        type: 'choice',
        options: [
          "Sports/fitness",
          "Reading/podcasts",
          "Games/streaming",
          "Art/music/creating",
          "Cooking/baking",
          "Friends/family time",
          "Side projects/building",
          "Exploring outdoors"
        ],
        placeholder: "Leisure activities",
        maxWords: 100
      },
      {
        id: 58,
        section: 'lifestyle-finances',
        prompt: "What's one habit you'd like to develop?",
        type: 'choice',
        options: [
          "Daily movement",
          "Consistent sleep schedule",
          "Focused deep work blocks",
          "Morning routine that sticks",
          "Money tracking weekly",
          "Learn 30 min/day",
          "Reach out/network weekly",
          "Digital declutter habit"
        ],
        placeholder: "Desired habit",
        maxWords: 100
      },
      {
        id: 59,
        section: 'lifestyle-finances',
        prompt: "What's one thing you'd like to simplify in your life?",
        type: 'choice',
        options: [
          "Calendar/schedule",
          "Finances/bills",
          "Digital files/inbox",
          "Wardrobe/home items",
          "Commitments/saying no",
          "Meal planning/cooking",
          "Chores/cleaning systems",
          "Work processes/automation"
        ],
        placeholder: "Simplification area",
        maxWords: 100
      },
      {
        id: 60,
        section: 'lifestyle-finances',
        prompt: "How do you recharge when you're feeling drained?",
        type: 'choice',
        options: [
          "Sleep/naps guilt-free",
          "Solo time and silence",
          "Nature/sunlight/walks",
          "Social time with my people",
          "Movement/sauna/stretching",
          "Hobbies/creative flow",
          "Screen-free day",
          "Treat yo self mini-ritual"
        ],
        placeholder: "Recovery methods",
        maxWords: 100
      },
      // Future Dreams & Aspirations (20 questions) - ids 61-80
      {
        id: 61,
        section: 'dreams-aspirations',
        prompt: "What's your biggest dream?",
        placeholder: "Ultimate aspiration",
        maxWords: 100
      },
      {
        id: 62,
        section: 'dreams-aspirations',
        prompt: "What's your dream job?",
        placeholder: "Ideal career",
        maxWords: 100
      },
      {
        id: 63,
        section: 'dreams-aspirations',
        prompt: "If success were guaranteed, what would you do?",
        placeholder: "Risk-free choice",
        maxWords: 100
      },
      {
        id: 64,
        section: 'dreams-aspirations',
        prompt: "What impact do you want to have on the world?",
        placeholder: "Your legacy",
        maxWords: 100
      },
      {
        id: 65,
        section: 'dreams-aspirations',
        prompt: "Where do you see yourself in 10 years?",
        placeholder: "Long-term vision",
        maxWords: 100
      },
      {
        id: 66,
        section: 'dreams-aspirations',
        prompt: "What's one skill you want to master?",
        placeholder: "Mastery goal",
        maxWords: 100
      },
      {
        id: 67,
        section: 'dreams-aspirations',
        prompt: "What's a problem in the world you'd love to solve?",
        placeholder: "World issue",
        maxWords: 100
      },
      {
        id: 68,
        section: 'dreams-aspirations',
        prompt: "What industry excites you the most?",
        placeholder: "Exciting field",
        maxWords: 100
      },
      {
        id: 69,
        section: 'dreams-aspirations',
        prompt: "What's one accomplishment that would make you feel fulfilled?",
        placeholder: "Fulfilling achievement",
        maxWords: 100
      },
      {
        id: 70,
        section: 'dreams-aspirations',
        prompt: "What's your ideal daily routine?",
        placeholder: "Perfect day structure",
        maxWords: 100
      },
      {
        id: 71,
        section: 'dreams-aspirations',
        prompt: "What kind of work-life balance do you want?",
        placeholder: "Ideal balance",
        maxWords: 100
      },
      {
        id: 72,
        section: 'dreams-aspirations',
        prompt: "What's one value you'll never compromise on?",
        placeholder: "Core principle",
        maxWords: 100
      },
      {
        id: 73,
        section: 'dreams-aspirations',
        prompt: "What kind of person do you want to become?",
        placeholder: "Future self",
        maxWords: 100
      },
      {
        id: 74,
        section: 'dreams-aspirations',
        prompt: "What's one thing you'd regret not trying?",
        placeholder: "Must-try experience",
        maxWords: 100
      },
      {
        id: 75,
        section: 'dreams-aspirations',
        prompt: "What's something you've always wanted to learn?",
        placeholder: "Learning goal",
        maxWords: 100
      },
      {
        id: 76,
        section: 'dreams-aspirations',
        prompt: "If you could create your perfect job, what would it be?",
        placeholder: "Custom role",
        maxWords: 100
      },
      {
        id: 77,
        section: 'dreams-aspirations',
        prompt: "What's one way you'd like to make a difference?",
        placeholder: "Impact method",
        maxWords: 100
      },
      {
        id: 78,
        section: 'dreams-aspirations',
        prompt: "What does your ideal future look like?",
        placeholder: "Future vision",
        maxWords: 100
      },
      {
        id: 79,
        section: 'dreams-aspirations',
        prompt: "What's one bold move you'd like to make?",
        placeholder: "Brave action",
        maxWords: 100
      },
      {
        id: 80,
        section: 'dreams-aspirations',
        prompt: "What's one legacy you'd like to leave behind?",
        placeholder: "Your mark",
        maxWords: 100
      },
      // Action Steps & Implementation (20 questions) - ids 81-100
      {
        id: 81,
        section: 'action-steps',
        prompt: "What's one small step you could take today toward your goals?",
        placeholder: "Today's action",
        maxWords: 100
      },
      {
        id: 82,
        section: 'action-steps',
        prompt: "What's holding you back from pursuing your dreams?",
        placeholder: "Main obstacle",
        maxWords: 100
      },
      {
        id: 83,
        section: 'action-steps',
        prompt: "What resources do you need to achieve your goals?",
        placeholder: "Required resources",
        maxWords: 100
      },
      {
        id: 84,
        section: 'action-steps',
        prompt: "Who could help you achieve your goals?",
        placeholder: "Potential supporters",
        maxWords: 100
      },
      {
        id: 85,
        section: 'action-steps',
        prompt: "What skills do you need to develop?",
        placeholder: "Skill requirements",
        maxWords: 100
      },
      {
        id: 86,
        section: 'action-steps',
        prompt: "What's one habit you need to build?",
        placeholder: "Essential habit",
        maxWords: 100
      },
      {
        id: 87,
        section: 'action-steps',
        prompt: "What's one thing you need to let go of?",
        placeholder: "Release this",
        maxWords: 100
      },
      {
        id: 88,
        section: 'action-steps',
        prompt: "What's your timeline for achieving your goals?",
        placeholder: "Time frame",
        maxWords: 100
      },
      {
        id: 89,
        section: 'action-steps',
        prompt: "What's your backup plan if things don't work out?",
        placeholder: "Plan B",
        maxWords: 100
      },
      {
        id: 90,
        section: 'action-steps',
        prompt: "How will you measure your progress?",
        placeholder: "Progress metrics",
        maxWords: 100
      },
      {
        id: 91,
        section: 'action-steps',
        prompt: "What's one obstacle you need to overcome?",
        placeholder: "Key barrier",
        maxWords: 100
      },
      {
        id: 92,
        section: 'action-steps',
        prompt: "What support system do you need to build?",
        placeholder: "Support needs",
        maxWords: 100
      },
      {
        id: 93,
        section: 'action-steps',
        prompt: "What's one risk you need to take?",
        placeholder: "Necessary risk",
        maxWords: 100
      },
      {
        id: 94,
        section: 'action-steps',
        prompt: "What's one boundary you need to set?",
        placeholder: "Important boundary",
        maxWords: 100
      },
      {
        id: 95,
        section: 'action-steps',
        prompt: "What's one commitment you need to make to yourself?",
        placeholder: "Self-promise",
        maxWords: 100
      },
      {
        id: 96,
        section: 'action-steps',
        prompt: "What's one thing you need to learn more about?",
        placeholder: "Knowledge gap",
        maxWords: 100
      },
      {
        id: 97,
        section: 'action-steps',
        prompt: "What's one connection you need to make?",
        placeholder: "Network need",
        maxWords: 100
      },
      {
        id: 98,
        section: 'action-steps',
        prompt: "What's one change you need to implement?",
        placeholder: "Key change",
        maxWords: 100
      },
      {
        id: 99,
        section: 'action-steps',
        prompt: "What's one decision you need to make?",
        placeholder: "Pending decision",
        maxWords: 100
      },
      {
        id: 100,
        section: 'action-steps',
        prompt: "What's your first step forward from here?",
        placeholder: "Next action",
        maxWords: 100
      }
    ]
  }
}

// Helper functions
export function getQuizConfig(quizType: string): QuizConfig | undefined {
  return quizConfigs[quizType]
}

export function getQuizSections(quizType: string): QuizSection[] {
  const config = getQuizConfig(quizType)
  if (!config || !config.sections) return []
  
  // Group questions by section
  const sectionsMap = new Map<string, QuizQuestion[]>()
  
  config.questions.forEach(question => {
    if (question.section) {
      const existing = sectionsMap.get(question.section) || []
      sectionsMap.set(question.section, [...existing, question])
    }
  })
  
  // Map sections with their questions
  return config.sections.map(section => ({
    ...section,
    questions: sectionsMap.get(section.id) || []
  }))
}

export function getQuestionsBySection(quizType: string, sectionId: string): QuizQuestion[] {
  const config = getQuizConfig(quizType)
  if (!config) return []
  
  return config.questions.filter(q => q.section === sectionId)
}

export function getTotalSections(quizType: string): number {
  const config = getQuizConfig(quizType)
  return config?.sections?.length || 1
}

export function getSectionProgress(quizType: string, sectionId: string, answers: Record<number, string>): number {
  const questions = getQuestionsBySection(quizType, sectionId)
  if (questions.length === 0) return 0
  
  const answeredCount = questions.filter(q => answers[q.id]?.trim()).length
  return (answeredCount / questions.length) * 100
}