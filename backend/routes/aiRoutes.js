const express = require("express");
const axios = require("axios");
const auth = require("../middleware/authMiddleware");
const Topic = require("../models/Topic");
const Revision = require("../models/Revision");
const router = express.Router();

// Generate REAL AI Quiz using Gemini 2.5 Flash
router.post("/quiz", auth, async (req, res) => {
  const { topic } = req.body;
  
  if (!topic) {
    return res.status(400).json({ msg: "Topic is required" });
  }

  try {
    console.log(`🤖 Generating AI quiz for topic: ${topic}`);
    
    const modelName = "gemini-2.5-flash";
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Generate a comprehensive quiz with EXACTLY 5 multiple choice questions about "${topic}".

CRITICAL FORMATTING RULES:
- Each question must have 4 DISTINCT, MEANINGFUL options
- Options must be REAL content related to the topic, not "Option A", "Option B"
- Clearly mark the correct answer
- Provide a brief explanation

FORMAT EXAMPLE:
Question 1: What is the time complexity for accessing an element in an array by index?
A) O(1) - Constant time
B) O(n) - Linear time
C) O(log n) - Logarithmic time
D) O(n²) - Quadratic time
Answer: A
Explanation: Arrays provide direct memory access using index positions, making access time constant O(1).

Generate 5 questions with this exact format for "${topic}". Make the options meaningful and educational.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          topP: 0.95,
          topK: 40,
        }
      }
    );

    if (!response.data.candidates || !response.data.candidates[0]) {
      throw new Error("No response from AI");
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    console.log("✅ AI Response received, length:", aiResponse.length);
    
    const quizData = parseQuizResponseImproved(aiResponse, topic);
    
    res.json({ 
      success: true,
      quiz: quizData,
      topic: topic,
      aiGenerated: true
    });
    
  } catch (error) {
    console.error("❌ AI Generation Error:", error.response?.data || error.message);
    
    // Return fallback quiz with real options
    const fallbackQuiz = createRealFallbackQuiz(topic);
    res.json({ 
      success: true,
      quiz: fallbackQuiz,
      topic: topic,
      aiGenerated: false,
      fallback: true
    });
  }
});

// 🤖 NEW: Chat Assistant Endpoint
router.post("/chat", auth, async (req, res) => {
  const { message, userTopics } = req.body;
  
  if (!message) {
    return res.status(400).json({ msg: "Message is required" });
  }

  try {
    console.log(`💬 Chat query: ${message}`);
    
    const modelName = "gemini-2.5-flash";
    
    // Get user's topics for personalized response
    let topicsContext = "";
    if (userTopics && userTopics.length > 0) {
      topicsContext = `\nUser is currently learning these topics: ${userTopics.map(t => t.title).join(", ")}.\n`;
    }
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful learning assistant for a Digital Forgetting Curve Manager app. 
Your role is to help users with:
1. When to revise topics based on forgetting curve
2. Explaining concepts clearly
3. Providing study tips and motivation
4. Answering questions about the forgetting curve system

USER QUESTION: "${message}"
${topicsContext}

Provide a friendly, helpful, and concise response (max 150 words). 
Focus on practical advice related to learning, revision timing, and concept understanding.
If asked about revision timing, explain the forgetting curve concept.
Be encouraging and supportive.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
          topP: 0.95,
          topK: 40,
        }
      }
    );

    if (!response.data.candidates || !response.data.candidates[0]) {
      throw new Error("No response from AI");
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    res.json({ 
      success: true,
      response: aiResponse,
      query: message
    });
    
  } catch (error) {
    console.error("❌ Chat Error:", error.response?.data || error.message);
    
    // Smart fallback responses based on message content
    const fallbackResponse = getSmartFallbackResponse(message);
    
    res.json({ 
      success: true,
      response: fallbackResponse,
      query: message,
      fallback: true
    });
  }
});

// Smart fallback responses for chat
function getSmartFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes("revise") || msg.includes("when")) {
    return "📚 Based on the forgetting curve, you should revise:\n\n" +
           "• Day 1: 24 hours after learning\n" +
           "• Day 3: 3 days after first revision\n" +
           "• Day 7: One week later\n" +
           "• Day 30: One month later\n\n" +
           "Each revision strengthens memory and extends the next interval. Your app tracks this automatically! 🎯";
  }
  
  if (msg.includes("forgetting curve")) {
    return "🧠 The Forgetting Curve (Ebbinghaus) shows that without revision, we forget:\n\n" +
           "• 50% within 1 hour\n" +
           "• 70% within 24 hours\n" +
           "• 90% within 1 week\n\n" +
           "✨ Solution: Spaced repetition! Each revision resets the curve and makes memory decay slower. Your app schedules revisions exactly when you need them!";
  }
  
  if (msg.includes("memory") || msg.includes("strength")) {
    return "💪 Memory strength in your app is calculated using:\n\n" +
           "Memory = 100 × e^(-days / strength)\n\n" +
           "• Higher strength = slower forgetting\n" +
           "• Each revision increases strength by 1\n" +
           "• The chart shows how memory decays over time\n\n" +
           "Keep revising to build strong, long-term memory! 🚀";
  }
  
  if (msg.includes("topic") || msg.includes("learn")) {
    return "📖 Great job learning new topics! Here's my advice:\n\n" +
           "1️⃣ Add topics regularly\n" +
           "2️⃣ Revise when the app reminds you\n" +
           "3️⃣ Use the AI quiz to test yourself\n" +
           "4️⃣ Watch the memory chart improve\n\n" +
           "Consistency beats intensity! Small, regular revisions create lasting knowledge. 💡";
  }
  
  if (msg.includes("hello") || msg.includes("hi")) {
    return "👋 Hello! I'm your learning assistant. I can help you with:\n\n" +
           "• When to revise topics\n" +
           "• Explaining concepts\n" +
           "• Understanding the forgetting curve\n" +
           "• Study tips and motivation\n\n" +
           "What would you like to know? 🤔";
  }
  
  if (msg.includes("thanks") || msg.includes("thank")) {
    return "You're welcome! 😊 Keep learning and revising regularly. Remember, small consistent efforts lead to mastery. If you need anything else, I'm here to help! 🌟";
  }
  
  return "💡 I'm your AI learning assistant! I can help you with:\n\n" +
         "• 📅 When to revise topics\n" +
         "• 🧠 Understanding the forgetting curve\n" +
         "• 📚 Explaining concepts\n" +
         "• 💪 Study tips and motivation\n\n" +
         "What would you like to know about your learning journey? 🤓";
}

// ... (keep all existing parsing functions from previous code)
function parseQuizResponseImproved(aiText, topic) {
  const questions = [];
  const questionPattern = /Question\s+\d+:\s*([^\n]+)/gi;
  const matches = [...aiText.matchAll(/Question\s+\d+:\s*([^\n]+)\n([\s\S]*?)(?=Question\s+\d+:|$)/gi)];
  
  for (let i = 0; i < Math.min(matches.length, 5); i++) {
    const match = matches[i];
    const questionText = match[1].trim();
    const block = match[2];
    
    const options = [];
    const optionPattern = /([A-D])\)\s*([^\n]+)/g;
    let optionMatch;
    while ((optionMatch = optionPattern.exec(block)) !== null) {
      options.push({
        letter: optionMatch[1],
        text: optionMatch[2].trim()
      });
    }
    
    let correctAnswer = 'A';
    const answerMatch = block.match(/Answer:\s*([A-D])/i);
    if (answerMatch) {
      correctAnswer = answerMatch[1].toUpperCase();
    }
    
    let explanation = "Review the topic to understand this concept better.";
    const explanationMatch = block.match(/Explanation:\s*([^\n]+)/i);
    if (explanationMatch) {
      explanation = explanationMatch[1].trim();
    }
    
    if (options.length === 4 && questionText) {
      questions.push({
        id: i + 1,
        question: questionText,
        options: options.map(opt => opt.text),
        correctAnswer: correctAnswer,
        explanation: explanation
      });
    }
  }
  
  if (questions.length < 5) {
    const fallbackQuestions = getFallbackQuestionsForTopic(topic);
    while (questions.length < 5 && fallbackQuestions.length > 0) {
      questions.push(fallbackQuestions[questions.length]);
    }
  }
  
  return {
    topic: topic,
    questions: questions.slice(0, 5),
    totalQuestions: Math.min(questions.length, 5),
    generatedAt: new Date().toISOString()
  };
}

function getFallbackQuestionsForTopic(topic) {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('array')) {
    return [
      {
        id: 1,
        question: "What is the time complexity for accessing an element in an array by index?",
        options: ["O(1) - Constant time", "O(n) - Linear time", "O(log n) - Logarithmic time", "O(n²) - Quadratic time"],
        correctAnswer: "A",
        explanation: "Arrays provide direct memory access using index positions, making access time constant O(1)."
      },
      {
        id: 2,
        question: "What happens when you try to access an array index that is out of bounds in JavaScript?",
        options: ["The program crashes with an error", "Returns undefined", "Returns null", "Automatically expands the array"],
        correctAnswer: "B",
        explanation: "In JavaScript, accessing an out-of-bounds index returns undefined without throwing an error."
      },
      {
        id: 3,
        question: "Which method adds elements to the end of an array in JavaScript?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "A",
        explanation: "The push() method adds elements to the end of an array and returns the new length."
      },
      {
        id: 4,
        question: "What is the default value of elements in a newly created integer array in C?",
        options: ["0", "NULL", "Garbage value", "Undefined"],
        correctAnswer: "C",
        explanation: "In C, uninitialized array elements contain garbage values from memory."
      },
      {
        id: 5,
        question: "Which is a valid way to declare an array in Java?",
        options: ["int[] arr = new int[5];", "int arr[] = new int[5];", "Both A and B", "Neither A nor B"],
        correctAnswer: "C",
        explanation: "In Java, both int[] arr and int arr[] syntaxes are valid for array declaration."
      }
    ];
  }
  
  return [
    {
      id: 1,
      question: `What is the fundamental concept of ${topic}?`,
      options: [`Basic principles of ${topic}`, `Advanced techniques`, `Theoretical frameworks`, `Practical applications`],
      correctAnswer: "A",
      explanation: `Understanding the fundamentals of ${topic} is essential for mastery.`
    },
    {
      id: 2,
      question: `Why is ${topic} important?`,
      options: ["Improves efficiency", "Enables problem-solving", "Provides scalability", "All of the above"],
      correctAnswer: "D",
      explanation: `${topic} contributes to multiple aspects of computing.`
    },
    {
      id: 3,
      question: `Which is a common application of ${topic}?`,
      options: ["Web Development", "Database Systems", "Operating Systems", "All of the above"],
      correctAnswer: "D",
      explanation: `${topic} has versatile applications across various domains.`
    },
    {
      id: 4,
      question: `What is a key benefit of mastering ${topic}?`,
      options: ["Career opportunities", "Problem-solving skills", "Understanding complex systems", "All of the above"],
      correctAnswer: "D",
      explanation: `Mastering ${topic} provides comprehensive benefits.`
    },
    {
      id: 5,
      question: `How does ${topic} contribute to development?`,
      options: ["Efficient solutions", "Optimization techniques", "Scalable architecture", "All of the above"],
      correctAnswer: "D",
      explanation: `${topic} enhances development through efficiency, optimization, and scalability.`
    }
  ];
}

function createRealFallbackQuiz(topic) {
  const fallbackQuestions = getFallbackQuestionsForTopic(topic);
  return {
    topic: topic,
    questions: fallbackQuestions,
    totalQuestions: fallbackQuestions.length,
    fallback: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = router;