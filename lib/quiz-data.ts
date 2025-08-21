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
        placeholder: "Where do you see yourself professionally?",
        maxWords: 100
      },
      {
        id: 2,
        prompt: "What skills do you currently possess?",
        placeholder: "List your top skills and expertise",
        maxWords: 100
      },
      {
        id: 3,
        prompt: "What industry interests you the most?",
        placeholder: "Which field excites you?",
        maxWords: 100
      },
      {
        id: 4,
        prompt: "Describe your ideal work environment.",
        placeholder: "Remote? Office? Team size? Culture?",
        maxWords: 100
      },
      {
        id: 5,
        prompt: "What's your educational background?",
        placeholder: "Degrees, certifications, courses...",
        maxWords: 100
      },
      {
        id: 6,
        prompt: "What are your salary expectations?",
        placeholder: "Be honest about your financial goals",
        maxWords: 100
      },
      {
        id: 7,
        prompt: "What skills would you like to develop?",
        placeholder: "What do you want to learn next?",
        maxWords: 100
      },
      {
        id: 8,
        prompt: "What's your preferred work style?",
        placeholder: "Independent? Collaborative? Structured?",
        maxWords: 100
      },
      {
        id: 9,
        prompt: "What challenges are you facing in your career?",
        placeholder: "What's holding you back?",
        maxWords: 100
      },
      {
        id: 10,
        prompt: "What motivates you professionally?",
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
        placeholder: "Your current position or situation",
        maxWords: 100
      },
      {
        id: 2,
        section: 'current-situation',
        prompt: "How would you describe yourself in one sentence today?",
        placeholder: "A brief self-description",
        maxWords: 100
      },
      {
        id: 3,
        section: 'current-situation',
        prompt: "What skills do you use most often in your work?",
        placeholder: "Your most-used abilities",
        maxWords: 100
      },
      {
        id: 4,
        section: 'current-situation',
        prompt: "What's one skill you feel confident in?",
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
        placeholder: "Current work obstacles",
        maxWords: 100
      },
      {
        id: 7,
        section: 'current-situation',
        prompt: "Where do you live, and how do you feel about it?",
        placeholder: "Your location and feelings about it",
        maxWords: 100
      },
      {
        id: 8,
        section: 'current-situation',
        prompt: "How do you feel about your current work-life balance?",
        placeholder: "Your thoughts on balance",
        maxWords: 100
      },
      {
        id: 9,
        section: 'current-situation',
        prompt: "What's one thing you'd like to change about your daily life?",
        placeholder: "Something you want to improve",
        maxWords: 100
      },
      {
        id: 10,
        section: 'current-situation',
        prompt: "How do you feel about your current financial situation?",
        placeholder: "Your financial comfort level",
        maxWords: 100
      },
      {
        id: 11,
        section: 'current-situation',
        prompt: "What's one financial goal you're working toward?",
        placeholder: "A money-related objective",
        maxWords: 100
      },
      {
        id: 12,
        section: 'current-situation',
        prompt: "Who are the people you spend the most time with?",
        placeholder: "Your inner circle",
        maxWords: 100
      },
      {
        id: 13,
        section: 'current-situation',
        prompt: "How do you feel about your current relationships?",
        placeholder: "Your social connections",
        maxWords: 100
      },
      {
        id: 14,
        section: 'current-situation',
        prompt: "What's one value you prioritize the most in your life right now?",
        placeholder: "Your core value",
        maxWords: 100
      },
      {
        id: 15,
        section: 'current-situation',
        prompt: "What's one fear you feel is holding you back today?",
        placeholder: "Something that worries you",
        maxWords: 100
      },
      {
        id: 16,
        section: 'current-situation',
        prompt: "How do you usually spend your free time?",
        placeholder: "Your leisure activities",
        maxWords: 100
      },
      {
        id: 17,
        section: 'current-situation',
        prompt: "What's one professional goal you're working toward?",
        placeholder: "A career objective",
        maxWords: 100
      },
      {
        id: 18,
        section: 'current-situation',
        prompt: "How do you feel about your current industry or field?",
        placeholder: "Your thoughts on your sector",
        maxWords: 100
      },
      {
        id: 19,
        section: 'current-situation',
        prompt: "What's the biggest financial challenge you're facing right now?",
        placeholder: "Money-related difficulties",
        maxWords: 100
      },
      {
        id: 20,
        section: 'current-situation',
        prompt: "How connected do you feel to your community?",
        placeholder: "Your sense of belonging",
        maxWords: 100
      },
      // Future Aspirations (20 questions)
      {
        id: 21,
        section: 'future-aspirations',
        prompt: "What's your dream job?",
        placeholder: "Your ideal role",
        maxWords: 100
      },
      {
        id: 22,
        section: 'future-aspirations',
        prompt: "What's the biggest dream you've ever had?",
        placeholder: "Your grandest aspiration",
        maxWords: 100
      },
      {
        id: 23,
        section: 'future-aspirations',
        prompt: "What's one skill you want to build for your career?",
        placeholder: "A skill to develop",
        maxWords: 100
      },
      {
        id: 24,
        section: 'future-aspirations',
        prompt: "What impact do you want to have on the world?",
        placeholder: "Your desired contribution",
        maxWords: 100
      },
      {
        id: 25,
        section: 'future-aspirations',
        prompt: "If you could create your own job, what would it look like?",
        placeholder: "Design your perfect role",
        maxWords: 100
      },
      {
        id: 26,
        section: 'future-aspirations',
        prompt: "What's a problem in the world you'd love to solve?",
        placeholder: "An issue you care about",
        maxWords: 100
      },
      {
        id: 27,
        section: 'future-aspirations',
        prompt: "What industry excites you the most right now?",
        placeholder: "A field that interests you",
        maxWords: 100
      },
      {
        id: 28,
        section: 'future-aspirations',
        prompt: "What's one accomplishment that would make you feel fulfilled?",
        placeholder: "A meaningful achievement",
        maxWords: 100
      },
      {
        id: 29,
        section: 'future-aspirations',
        prompt: "Where do you want to live in 10 years?",
        placeholder: "Your ideal location",
        maxWords: 100
      },
      {
        id: 30,
        section: 'future-aspirations',
        prompt: "What's your ideal daily routine?",
        placeholder: "Your perfect day",
        maxWords: 100
      },
      {
        id: 31,
        section: 'future-aspirations',
        prompt: "What kind of work-life balance would make you happiest?",
        placeholder: "Your ideal balance",
        maxWords: 100
      },
      {
        id: 32,
        section: 'future-aspirations',
        prompt: "What's one value you'll never compromise on?",
        placeholder: "Your non-negotiable",
        maxWords: 100
      },
      {
        id: 33,
        section: 'future-aspirations',
        prompt: "What kind of person do you want to be in 10 years?",
        placeholder: "Your future self",
        maxWords: 100
      },
      {
        id: 34,
        section: 'future-aspirations',
        prompt: "What's one thing about yourself you're most proud of?",
        placeholder: "Your pride point",
        maxWords: 100
      },
      {
        id: 35,
        section: 'future-aspirations',
        prompt: "What's an activity you can do for hours without getting bored?",
        placeholder: "Your flow activity",
        maxWords: 100
      },
      {
        id: 36,
        section: 'future-aspirations',
        prompt: "What's one topic you'd love to learn more about?",
        placeholder: "Something to explore",
        maxWords: 100
      },
      {
        id: 37,
        section: 'future-aspirations',
        prompt: "If you could turn a hobby into a career, what would it be?",
        placeholder: "Monetizing your passion",
        maxWords: 100
      },
      {
        id: 38,
        section: 'future-aspirations',
        prompt: "What unique contribution do you want to make?",
        placeholder: "Your special offering",
        maxWords: 100
      },
      {
        id: 39,
        section: 'future-aspirations',
        prompt: "What does financial success mean to you?",
        placeholder: "Your money mindset",
        maxWords: 100
      },
      {
        id: 40,
        section: 'future-aspirations',
        prompt: "Who's living a life you admire, and why?",
        placeholder: "Your role model",
        maxWords: 100
      }
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
        placeholder: "Your current position",
        maxWords: 100
      },
      {
        id: 2,
        section: 'identity-values',
        prompt: "How would you describe yourself in one sentence today?",
        placeholder: "Brief self-description",
        maxWords: 100
      },
      {
        id: 3,
        section: 'identity-values',
        prompt: "What's one value you prioritize most in your life right now?",
        placeholder: "Your core value",
        maxWords: 100
      },
      {
        id: 4,
        section: 'identity-values',
        prompt: "What's one thing about yourself you feel confident in?",
        placeholder: "Your strength",
        maxWords: 100
      },
      {
        id: 5,
        section: 'identity-values',
        prompt: "What's one fear you feel is holding you back today?",
        placeholder: "Your concern",
        maxWords: 100
      },
      {
        id: 6,
        section: 'identity-values',
        prompt: "How do you usually spend your free time?",
        placeholder: "Leisure activities",
        maxWords: 100
      },
      {
        id: 7,
        section: 'identity-values',
        prompt: "What's one word to describe your current mindset?",
        placeholder: "Single word",
        maxWords: 100
      },
      {
        id: 8,
        section: 'identity-values',
        prompt: "What's one belief about yourself that you're questioning?",
        placeholder: "Self-doubt area",
        maxWords: 100
      },
      {
        id: 9,
        section: 'identity-values',
        prompt: "What's something you've recently accomplished that you're proud of?",
        placeholder: "Recent achievement",
        maxWords: 100
      },
      {
        id: 10,
        section: 'identity-values',
        prompt: "What's one habit you wish you could change?",
        placeholder: "Habit to improve",
        maxWords: 100
      },
      {
        id: 11,
        section: 'identity-values',
        prompt: "What motivates you the most right now?",
        placeholder: "Your driver",
        maxWords: 100
      },
      {
        id: 12,
        section: 'identity-values',
        prompt: "What's one word that describes the life you want?",
        placeholder: "Future vision word",
        maxWords: 100
      },
      {
        id: 13,
        section: 'identity-values',
        prompt: "What's your biggest strength?",
        placeholder: "Top ability",
        maxWords: 100
      },
      {
        id: 14,
        section: 'identity-values',
        prompt: "What's your biggest weakness?",
        placeholder: "Area to improve",
        maxWords: 100
      },
      {
        id: 15,
        section: 'identity-values',
        prompt: "What makes you unique?",
        placeholder: "Your differentiator",
        maxWords: 100
      },
      {
        id: 16,
        section: 'identity-values',
        prompt: "What's one thing you'd never compromise on?",
        placeholder: "Non-negotiable",
        maxWords: 100
      },
      {
        id: 17,
        section: 'identity-values',
        prompt: "What's your personal definition of success?",
        placeholder: "Success means...",
        maxWords: 100
      },
      {
        id: 18,
        section: 'identity-values',
        prompt: "What's one thing you wish others knew about you?",
        placeholder: "Hidden aspect",
        maxWords: 100
      },
      {
        id: 19,
        section: 'identity-values',
        prompt: "What's one life experience that shaped who you are?",
        placeholder: "Formative experience",
        maxWords: 100
      },
      {
        id: 20,
        section: 'identity-values',
        prompt: "What's one thing you're currently struggling with?",
        placeholder: "Current challenge",
        maxWords: 100
      },
      // Current Career & Skills (20 questions) - ids 21-40
      {
        id: 21,
        section: 'career-skills',
        prompt: "What skills do you use most often in your work?",
        placeholder: "Frequently used skills",
        maxWords: 100
      },
      {
        id: 22,
        section: 'career-skills',
        prompt: "What's one skill you feel particularly confident in?",
        placeholder: "Strong skill",
        maxWords: 100
      },
      {
        id: 23,
        section: 'career-skills',
        prompt: "What's one skill you'd like to improve?",
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
        placeholder: "Recent learning",
        maxWords: 100
      },
      {
        id: 26,
        section: 'career-skills',
        prompt: "What's a challenge you're facing in your work right now?",
        placeholder: "Work obstacle",
        maxWords: 100
      },
      {
        id: 27,
        section: 'career-skills',
        prompt: "What's one professional goal you're working toward?",
        placeholder: "Career goal",
        maxWords: 100
      },
      {
        id: 28,
        section: 'career-skills',
        prompt: "How do you feel about your current industry or field?",
        placeholder: "Industry thoughts",
        maxWords: 100
      },
      {
        id: 29,
        section: 'career-skills',
        prompt: "What's one thing you wish was different about your current job?",
        placeholder: "Job improvement",
        maxWords: 100
      },
      {
        id: 30,
        section: 'career-skills',
        prompt: "What's your favorite part of your current work?",
        placeholder: "Best aspect",
        maxWords: 100
      },
      {
        id: 31,
        section: 'career-skills',
        prompt: "What's your least favorite part of your current work?",
        placeholder: "Worst aspect",
        maxWords: 100
      },
      {
        id: 32,
        section: 'career-skills',
        prompt: "How do you handle work-related stress?",
        placeholder: "Stress management",
        maxWords: 100
      },
      {
        id: 33,
        section: 'career-skills',
        prompt: "What's your preferred working style?",
        placeholder: "Work preferences",
        maxWords: 100
      },
      {
        id: 34,
        section: 'career-skills',
        prompt: "How do you like to learn new things?",
        placeholder: "Learning style",
        maxWords: 100
      },
      {
        id: 35,
        section: 'career-skills',
        prompt: "What's one professional relationship you'd like to improve?",
        placeholder: "Relationship to enhance",
        maxWords: 100
      },
      {
        id: 36,
        section: 'career-skills',
        prompt: "What's one work achievement you're proud of?",
        placeholder: "Career highlight",
        maxWords: 100
      },
      {
        id: 37,
        section: 'career-skills',
        prompt: "What's one work-related decision you regret?",
        placeholder: "Career regret",
        maxWords: 100
      },
      {
        id: 38,
        section: 'career-skills',
        prompt: "How do you measure success in your current role?",
        placeholder: "Success metrics",
        maxWords: 100
      },
      {
        id: 39,
        section: 'career-skills',
        prompt: "What's one thing you'd change about your work environment?",
        placeholder: "Environment change",
        maxWords: 100
      },
      {
        id: 40,
        section: 'career-skills',
        prompt: "What's one professional opportunity you wish you had?",
        placeholder: "Desired opportunity",
        maxWords: 100
      },
      // Current Lifestyle & Finances (20 questions) - ids 41-60
      {
        id: 41,
        section: 'lifestyle-finances',
        prompt: "Where do you live, and how do you feel about it?",
        placeholder: "Location and feelings",
        maxWords: 100
      },
      {
        id: 42,
        section: 'lifestyle-finances',
        prompt: "What does your daily routine usually look like?",
        placeholder: "Typical day",
        maxWords: 100
      },
      {
        id: 43,
        section: 'lifestyle-finances',
        prompt: "How do you spend your weekends?",
        placeholder: "Weekend activities",
        maxWords: 100
      },
      {
        id: 44,
        section: 'lifestyle-finances',
        prompt: "What's your current work-life balance like?",
        placeholder: "Balance assessment",
        maxWords: 100
      },
      {
        id: 45,
        section: 'lifestyle-finances',
        prompt: "How do you feel about your current financial situation?",
        placeholder: "Financial comfort",
        maxWords: 100
      },
      {
        id: 46,
        section: 'lifestyle-finances',
        prompt: "What's one financial goal you're working toward?",
        placeholder: "Money goal",
        maxWords: 100
      },
      {
        id: 47,
        section: 'lifestyle-finances',
        prompt: "What's the biggest financial challenge you're facing?",
        placeholder: "Money challenge",
        maxWords: 100
      },
      {
        id: 48,
        section: 'lifestyle-finances',
        prompt: "How do you usually make decisions about money?",
        placeholder: "Financial decision process",
        maxWords: 100
      },
      {
        id: 49,
        section: 'lifestyle-finances',
        prompt: "What's one purchase you've made recently that you regret?",
        placeholder: "Regretted purchase",
        maxWords: 100
      },
      {
        id: 50,
        section: 'lifestyle-finances',
        prompt: "What's one thing you wish you could afford right now?",
        placeholder: "Desired purchase",
        maxWords: 100
      },
      {
        id: 51,
        section: 'lifestyle-finances',
        prompt: "How do you feel about your ability to manage money?",
        placeholder: "Money management skills",
        maxWords: 100
      },
      {
        id: 52,
        section: 'lifestyle-finances',
        prompt: "What's your relationship with saving and spending?",
        placeholder: "Financial habits",
        maxWords: 100
      },
      {
        id: 53,
        section: 'lifestyle-finances',
        prompt: "How do you feel about your current living space?",
        placeholder: "Home satisfaction",
        maxWords: 100
      },
      {
        id: 54,
        section: 'lifestyle-finances',
        prompt: "What's one thing you'd change about your lifestyle?",
        placeholder: "Lifestyle improvement",
        maxWords: 100
      },
      {
        id: 55,
        section: 'lifestyle-finances',
        prompt: "How do you typically handle stress?",
        placeholder: "Stress coping",
        maxWords: 100
      },
      {
        id: 56,
        section: 'lifestyle-finances',
        prompt: "What's your relationship with health and wellness?",
        placeholder: "Health habits",
        maxWords: 100
      },
      {
        id: 57,
        section: 'lifestyle-finances',
        prompt: "How do you spend your free time?",
        placeholder: "Leisure activities",
        maxWords: 100
      },
      {
        id: 58,
        section: 'lifestyle-finances',
        prompt: "What's one habit you'd like to develop?",
        placeholder: "Desired habit",
        maxWords: 100
      },
      {
        id: 59,
        section: 'lifestyle-finances',
        prompt: "What's one thing you'd like to simplify in your life?",
        placeholder: "Simplification area",
        maxWords: 100
      },
      {
        id: 60,
        section: 'lifestyle-finances',
        prompt: "How do you recharge when you're feeling drained?",
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