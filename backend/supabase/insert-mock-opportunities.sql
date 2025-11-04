-- ============================================
-- INSERT MOCK OPPORTUNITIES FOR TESTING
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert mock opportunities with matching UUIDs from server.js
INSERT INTO opportunities (id, title, company, location, type, rate, skills, questions, status)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Product Role (Internal)',
    'Vetted AI',
    'Remote (Global)',
    'Full-time',
    'N/A',
    '["Product Management", "Design", "Strategy"]'::jsonb,
    '[
      {"question_text": "Tell us about yourself.", "time_limit_seconds": 90},
      {"question_text": "Why do you want to work at Vetted AI?", "time_limit_seconds": 90},
      {"question_text": "Describe a product you built from scratch.", "time_limit_seconds": 120},
      {"question_text": "How do you prioritize features in a backlog?", "time_limit_seconds": 90},
      {"question_text": "What'\''s your approach to user research?", "time_limit_seconds": 90},
      {"question_text": "Tell us about a challenging stakeholder situation.", "time_limit_seconds": 120},
      {"question_text": "How do you measure product success?", "time_limit_seconds": 90},
      {"question_text": "Describe your experience with A/B testing.", "time_limit_seconds": 90},
      {"question_text": "How do you balance user needs with business goals?", "time_limit_seconds": 120},
      {"question_text": "What'\''s your product development process?", "time_limit_seconds": 90},
      {"question_text": "How do you handle conflicting feedback?", "time_limit_seconds": 90},
      {"question_text": "Describe a failed product and what you learned.", "time_limit_seconds": 120},
      {"question_text": "How do you work with engineering teams?", "time_limit_seconds": 90},
      {"question_text": "What product management tools do you use?", "time_limit_seconds": 60},
      {"question_text": "Why product management at Vetted AI?", "time_limit_seconds": 90}
    ]'::jsonb,
    'active'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Senior Backend Engineer',
    'CongratsAI',
    'Remote (Europe)',
    'Contract',
    '$90-120/hr',
    '["Node.js", "PostgreSQL", "Express", "Supabase", "TypeScript"]'::jsonb,
    '[
      {"question_text": "Introduce yourself and your background.", "time_limit_seconds": 90},
      {"question_text": "What'\''s your experience with Node.js at scale?", "time_limit_seconds": 120},
      {"question_text": "Explain how you design RESTful APIs.", "time_limit_seconds": 90},
      {"question_text": "How do you handle database optimization?", "time_limit_seconds": 120},
      {"question_text": "Describe a challenging performance issue you solved.", "time_limit_seconds": 120},
      {"question_text": "How do you approach microservices architecture?", "time_limit_seconds": 90},
      {"question_text": "What'\''s your experience with PostgreSQL?", "time_limit_seconds": 90},
      {"question_text": "How do you handle authentication and authorization?", "time_limit_seconds": 90},
      {"question_text": "Describe your testing strategy.", "time_limit_seconds": 90},
      {"question_text": "How do you ensure API security?", "time_limit_seconds": 120},
      {"question_text": "What'\''s your experience with real-time systems?", "time_limit_seconds": 90},
      {"question_text": "How do you handle errors and logging?", "time_limit_seconds": 90},
      {"question_text": "Describe your deployment process.", "time_limit_seconds": 90},
      {"question_text": "What'\''s your experience with TypeScript?", "time_limit_seconds": 60},
      {"question_text": "Why do you want to work with CongratsAI?", "time_limit_seconds": 90}
    ]'::jsonb,
    'active'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'ML Engineer (Computer Vision)',
    'VisionFlow AI',
    'Hybrid (Paris)',
    'Full-time',
    '€80-100/hr',
    '["Python", "TensorFlow", "PyTorch", "Computer Vision", "Docker"]'::jsonb,
    '[
      {"question_text": "Tell us about your background in machine learning.", "time_limit_seconds": 90},
      {"question_text": "What computer vision projects have you worked on?", "time_limit_seconds": 120},
      {"question_text": "Explain your approach to model training.", "time_limit_seconds": 120},
      {"question_text": "How do you handle imbalanced datasets?", "time_limit_seconds": 90},
      {"question_text": "Describe your experience with deep learning frameworks.", "time_limit_seconds": 90},
      {"question_text": "How do you optimize model performance?", "time_limit_seconds": 120},
      {"question_text": "What'\''s your experience with object detection?", "time_limit_seconds": 90},
      {"question_text": "How do you handle data augmentation?", "time_limit_seconds": 90},
      {"question_text": "Describe your model deployment experience.", "time_limit_seconds": 120},
      {"question_text": "How do you evaluate model accuracy?", "time_limit_seconds": 90},
      {"question_text": "What'\''s your experience with transfer learning?", "time_limit_seconds": 90},
      {"question_text": "How do you handle overfitting?", "time_limit_seconds": 90},
      {"question_text": "Describe your data preprocessing pipeline.", "time_limit_seconds": 90},
      {"question_text": "What hardware do you prefer for training?", "time_limit_seconds": 60},
      {"question_text": "Why VisionFlow AI?", "time_limit_seconds": 90}
    ]'::jsonb,
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  location = EXCLUDED.location,
  type = EXCLUDED.type,
  rate = EXCLUDED.rate,
  skills = EXCLUDED.skills,
  questions = EXCLUDED.questions,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Verify the insert
SELECT id, title, company, json_array_length(questions::json) as question_count
FROM opportunities
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003'
);
