'use client';
import { useState } from 'react';
import { trackToolUsage } from '@/lib/analytics';

const categories = [
  { max: 18.5, label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', advice: 'Consider consulting a nutritionist to reach a healthy weight.' },
  { max: 25, label: 'Normal weight', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', advice: 'Great! Maintain your healthy lifestyle with balanced diet and exercise.' },
  { max: 30, label: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', advice: 'Light dietary adjustments and regular exercise can help.' },
  { max: Infinity, label: 'Obese', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', advice: 'Consult a healthcare professional for a personalized plan.' },
];

export default function BMICalculator() {
  const [unit, setUnit] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return;

    let bmi;
    if (unit === 'metric') {
      bmi = w / ((h / 100) ** 2);
    } else {
      const totalInches = h * 12 + (parseFloat(heightIn) || 0);
      bmi = (703 * w) / (totalInches ** 2);
    }

    const cat = categories.find(c => bmi < c.max);
    const idealMin = unit === 'metric' ? (18.5 * ((h / 100) ** 2)).toFixed(1) : (18.5 * ((height * 12 + parseFloat(heightIn || 0)) ** 2) / 703).toFixed(1);
    const idealMax = unit === 'metric' ? (24.9 * ((h / 100) ** 2)).toFixed(1) : (24.9 * ((height * 12 + parseFloat(heightIn || 0)) ** 2) / 703).toFixed(1);

    trackToolUsage('bmi-calculator', 'BMI Calculator');
    setResult({ bmi: bmi.toFixed(1), category: cat, idealMin, idealMax });
  };

  const pct = result ? Math.min(100, Math.max(0, ((parseFloat(result.bmi) - 10) / 30) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[{ id: 'metric', label: 'Metric (kg/cm)' }, { id: 'imperial', label: 'Imperial (lbs/ft)' }].map(u => (
          <button key={u.id} onClick={() => { setUnit(u.id); setResult(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${unit === u.id ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>
            {u.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === 'metric' ? '70' : '154'}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        </div>
        {unit === 'metric' ? (
          <div>
            <label className="block text-sm font-medium mb-2">Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175"
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Height (ft)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="5"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Inches</label>
              <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="9"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>
        )}
      </div>

      <button onClick={calculate} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
        Calculate BMI
      </button>

      {result && (
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border ${result.category.bg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Your BMI</p>
                <p className={`text-5xl font-bold ${result.category.color}`}>{result.bmi}</p>
              </div>
              <div className="text-right">
                <span className={`text-lg font-semibold ${result.category.color}`}>{result.category.label}</span>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{result.category.advice}</p>
              </div>
            </div>
            {/* BMI Scale */}
            <div className="mt-4">
              <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow" style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-muted/30 border border-border rounded-xl text-sm">
            <p className="font-medium mb-1">Healthy weight range for your height:</p>
            <p className="text-muted-foreground">{result.idealMin} – {result.idealMax} {unit === 'metric' ? 'kg' : 'lbs'}</p>
          </div>
          <p className="text-xs text-muted-foreground text-center">BMI is a screening tool, not a diagnostic measure. Consult a healthcare professional for medical advice.</p>
        </div>
      )}
    </div>
  );
}
