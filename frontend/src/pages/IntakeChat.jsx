import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

const questions = [
  { id: 'household_size', text: 'How many people are in your household?', type: 'number' },
  { id: 'picky_eaters', text: 'Do you have any picky eaters or dietary restrictions?', type: 'text' },
  {
    id: 'cooking_days',
    text: 'Which days do you usually cook?',
    type: 'multi',
    options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: 'goals',
    text: 'What are your goals for meal planning?',
    type: 'multi',
    options: ['Save time', 'Eat healthier', 'Save money'],
  },
  {
    id: 'skill_level',
    text: 'How would you describe your cooking skill level?',
    type: 'select',
    options: ['beginner', 'confident', 'advanced'],
  },
  {
    id: 'exploration_pref',
    text: 'Are you open to trying new foods?',
    type: 'select',
    options: ['yes', 'occasionally', 'no'],
  },
  {
    id: 'tone',
    text: 'Which tone do you prefer from your assistant?',
    type: 'select',
    options: ['coach', 'companion'],
  },
  { id: 'nudges', text: 'Would you like nudging reminders?', type: 'toggle' },
  {
    id: 'learning_pref',
    text: 'Should I encourage learning new techniques?',
    type: 'toggle',
  },
];

function IntakeChat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const ackMessages = ['Got it!', 'Thanks!', 'Okay!'];

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const addMessage = (from, text) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  useEffect(() => {
    setMessages([{ from: 'assistant', text: questions[0].text }]);
    setInputValue('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatValue = (val) => {
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return val;
  };

  const handleNext = async () => {
    const q = questions[index];
    const value = inputValue;
    if (q.type === 'multi') {
      if (!Array.isArray(value) || value.length === 0) return;
    } else if (q.type === 'number' && value === '') return;

    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    addMessage('user', formatValue(value));
    await delay(500 + Math.random() * 500);
    addMessage('assistant', ackMessages[Math.floor(Math.random() * ackMessages.length)]);
    await delay(500);

    if (index < questions.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      const nextQ = questions[nextIndex];
      setInputValue(
        nextQ.type === 'multi' ? [] : nextQ.type === 'toggle' ? false : ''
      );
      setMessages([{ from: 'assistant', text: nextQ.text }]);
    } else {
      await saveProfile({ ...answers, [q.id]: value });
    }
  };

  const saveProfile = async (data) => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      addMessage('assistant', 'You must be logged in.');
      setLoading(false);
      return;
    }
    const payload = { ...data, user_id: user.id };
    const { error } = await supabase
      .from('meal_profiles')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) {
      addMessage('assistant', `Error: ${error.message}`);
    } else {
      addMessage('assistant', 'Profile saved! Redirecting...');
      setTimeout(() => navigate('/meals'), 1500);
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (index === 0) return;
    const prevIndex = index - 1;
    setIndex(prevIndex);
    const prevQ = questions[prevIndex];
    const prevValue = answers[prevQ.id];
    setInputValue(prevValue !== undefined ? prevValue : '');
    setMessages([{ from: 'assistant', text: prevQ.text }]);
  };

  const toggleMultiValue = (val) => {
    if (!Array.isArray(inputValue)) return;
    setInputValue((prev) => {
      const arr = prev || [];
      return arr.includes(val)
        ? arr.filter((v) => v !== val)
        : [...arr, val];
    });
  };

  const renderInput = () => {
    const q = questions[index];
    if (q.type === 'number' || q.type === 'text') {
      return (
        <input
          type={q.type === 'number' ? 'number' : 'text'}
          className="w-full px-3 py-2 border rounded"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      );
    }
    if (q.type === 'multi') {
      const arr = Array.isArray(inputValue) ? inputValue : [];
      return (
        <div className="flex flex-wrap gap-2">
          {q.options.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => toggleMultiValue(opt)}
              className={`px-3 py-2 rounded border ${arr.includes(opt) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (q.type === 'select') {
      return (
        <select
          className="w-full px-3 py-2 border rounded"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        >
          {q.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (q.type === 'toggle') {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputValue(true)}
            className={`px-3 py-2 rounded border ${inputValue === true ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setInputValue(false)}
            className={`px-3 py-2 rounded border ${inputValue === false ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            No
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="max-w-xl mx-auto w-full flex flex-col">
      <div className="flex flex-col space-y-2 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-lg max-w-full w-fit ${
              m.from === 'assistant'
                ? 'bg-gray-200 self-start'
                : 'bg-blue-500 text-white self-end'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-auto space-y-2">
        {renderInput()}
        <div className="flex justify-between pt-2">
          {index > 0 && (
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleNext}
            disabled={loading}
          >
            {index === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default IntakeChat;
