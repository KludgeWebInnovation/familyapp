import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

function getCurrentWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().split('T')[0];
}

function generatePrompt(profile) {
  if (!profile) return '';
  const {
    household_size,
    picky_eaters,
    cooking_days,
    goals,
    tone,
    ingredient_avoid,
  } = profile;
  const days = Array.isArray(cooking_days) && cooking_days.length
    ? cooking_days.join(', ')
    : 'Mon–Fri';
  const avoid = Array.isArray(ingredient_avoid) && ingredient_avoid.length
    ? `Avoid foods with ${ingredient_avoid.join(', ')}.`
    : '';
  const goalText = Array.isArray(goals) && goals.length
    ? `They want to ${goals.join(' and ').toLowerCase()}.`
    : '';
  const pickyText = picky_eaters ? ` with ${picky_eaters}` : '';
  const toneText = tone ? `Keep tone ${tone}.` : '';

  return `Create a weekly meal plan for a family of ${household_size || 3}${pickyText}. They cook ${days}. ${goalText} ${toneText} ${avoid}`.trim();
}

function Meals() {
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    setLoading(true);
    setError('');
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: profile, error: profileError } = await supabase
        .from('meal_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profileError) throw profileError;

      const prompt = generatePrompt(profile);
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      const res = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 500 },
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to generate plan');
      const json = await res.json();
        const content =
          (Array.isArray(json) ? json[0]?.generated_text : json.generated_text)?.trim();
        setPlan(content || '');

      const weekStart = getCurrentWeekStart();
        await supabase
          .from('meal_plans')
          .upsert(
            { user_id: user.id, week_start: weekStart, plan: { text: content } },
            {
              onConflict: 'user_id,week_start',
            }
          );
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error generating plan');
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      setError('');
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const weekStart = getCurrentWeekStart();
          const { data: existing, error } = await supabase
            .from('meal_plans')
            .select('plan')
            .eq('user_id', user.id)
            .eq('week_start', weekStart)
            .single();

          if (existing && !error) {
            setPlan(existing.plan?.text || '');
            setLoading(false);
            return;
          }

        await fetchPlan();
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error generating plan');
        setLoading(false);
      }
    };

    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Meals</h2>
      {loading && <p>Generating plan...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {plan && (
        <div className="p-4 border rounded bg-gray-50 whitespace-pre-wrap">
          {plan}
        </div>
      )}
      <button
        type="button"
        onClick={fetchPlan}
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        Regenerate Plan
      </button>
    </section>
  );
}

export default Meals;
