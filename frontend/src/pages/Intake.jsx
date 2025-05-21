import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

function Intake() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    household_size: '',
    picky_eaters: '',
    cooking_days: [],
    goals: [],
    diet_type: '',
    ingredient_avoid: '',
    skill_level: 'beginner',
    weeknight_time: '',
    batch_cooking: false,
    meals_per_day: 1,
    exploration_pref: 'yes',
    tone: 'coach',
    nudges: false,
    learning_pref: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('meal_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setFormData({
          household_size: data.household_size || '',
          picky_eaters: data.picky_eaters || '',
          cooking_days: data.cooking_days || [],
          goals: data.goals || [],
          diet_type: data.diet_type || '',
          ingredient_avoid: (data.ingredient_avoid || []).join(', '),
          skill_level: data.skill_level || 'beginner',
          weeknight_time: data.weeknight_time || '',
          batch_cooking: data.batch_cooking || false,
          meals_per_day: data.meals_per_day || 1,
          exploration_pref: data.exploration_pref || 'yes',
          tone: data.tone || 'coach',
          nudges: data.nudges || false,
          learning_pref: data.learning_pref || false,
        });
      }
    };
    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      household_size: Number(formData.household_size) || null,
      picky_eaters: formData.picky_eaters,
      cooking_days: formData.cooking_days,
      goals: formData.goals,
      diet_type: formData.diet_type,
      ingredient_avoid: formData.ingredient_avoid
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      skill_level: formData.skill_level,
      weeknight_time: Number(formData.weeknight_time) || null,
      batch_cooking: formData.batch_cooking,
      meals_per_day: Number(formData.meals_per_day) || null,
      exploration_pref: formData.exploration_pref,
      tone: formData.tone,
      nudges: formData.nudges,
      learning_pref: formData.learning_pref,
    };

    const { error } = await supabase
      .from('meal_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Profile saved! Redirecting...');
      setTimeout(() => navigate('/meals'), 1500);
    }
    setLoading(false);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const goalsList = ['Save time', 'Eat healthier', 'Save money'];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Household Size</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded"
                value={formData.household_size}
                onChange={(e) => handleChange('household_size', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Picky Eaters</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={formData.picky_eaters}
                onChange={(e) => handleChange('picky_eaters', e.target.value)}
              />
            </div>
            <div>
              <p className="mb-1">Cooking Days</p>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <label key={d} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={formData.cooking_days.includes(d)}
                      onChange={() => toggleArrayValue('cooking_days', d)}
                    />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <p className="mb-1">Goals</p>
              <div className="flex flex-wrap gap-2">
                {goalsList.map((g) => (
                  <label key={g} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={formData.goals.includes(g)}
                      onChange={() => toggleArrayValue('goals', g)}
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1">Dietary Preferences</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={formData.diet_type}
                onChange={(e) => handleChange('diet_type', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Ingredients to Avoid (comma separated)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={formData.ingredient_avoid}
                onChange={(e) => handleChange('ingredient_avoid', e.target.value)}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Skill Level</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.skill_level}
                onChange={(e) => handleChange('skill_level', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="confident">Confident cook</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Weeknight Time (mins)</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.weeknight_time}
                onChange={(e) => handleChange('weeknight_time', e.target.value)}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45+</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label>Batch Cooking</label>
              <input
                type="checkbox"
                checked={formData.batch_cooking}
                onChange={(e) => handleChange('batch_cooking', e.target.checked)}
              />
            </div>
            <div>
              <label className="block mb-1">Meals per Day</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.meals_per_day}
                onChange={(e) => handleChange('meals_per_day', e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Openness to New Ingredients</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.exploration_pref}
                onChange={(e) => handleChange('exploration_pref', e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="occasionally">Occasionally</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Tone Preference</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.tone}
                onChange={(e) => handleChange('tone', e.target.value)}
              >
                <option value="coach">Coach</option>
                <option value="companion">Companion</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label>Nudging OK?</label>
              <input
                type="checkbox"
                checked={formData.nudges}
                onChange={(e) => handleChange('nudges', e.target.checked)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label>Encourage Learning?</label>
              <input
                type="checkbox"
                checked={formData.learning_pref}
                onChange={(e) => handleChange('learning_pref', e.target.checked)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Meal Planner Intake</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStep()}
        <div className="flex justify-between pt-4">
          {step > 0 && (
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              className="ml-auto px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          )}
          {step === 3 && (
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {success && <p className="mt-2 text-green-600">{success}</p>}
    </section>
  );
}

export default Intake;

