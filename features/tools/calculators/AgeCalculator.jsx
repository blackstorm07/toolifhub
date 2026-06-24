'use client';
import { useState } from 'react';
import { trackToolUsage } from '@/lib/analytics';

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [refDate, setRefDate] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const ref = refDate ? new Date(refDate) : new Date();
    if (birth >= ref) { setResult({ error: 'Date of birth must be in the past.' }); return; }

    let years = ref.getFullYear() - birth.getFullYear();
    let months = ref.getMonth() - birth.getMonth();
    let days = ref.getDate() - birth.getDate();

    if (days < 0) { months--; days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((ref - birth) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    const nextBirthday = new Date(birth);
    nextBirthday.setFullYear(ref.getFullYear());
    if (nextBirthday <= ref) nextBirthday.setFullYear(ref.getFullYear() + 1);
    const daysToNext = Math.floor((nextBirthday - ref) / (1000 * 60 * 60 * 24));
    const dayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' });

    trackToolUsage('age-calculator', 'Age Calculator');
    setResult({ years, months, days, totalDays, totalWeeks, totalMonths, totalHours, daysToNext, dayOfWeek });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date of Birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} max={today}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Calculate Age As Of (optional)</label>
          <input type="date" value={refDate} onChange={e => setRefDate(e.target.value)} max={today}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        </div>
      </div>
      <button onClick={calculate} disabled={!dob}
        className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
        Calculate Age
      </button>

      {result?.error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{result.error}</div>}

      {result && !result.error && (
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 border border-brand-200 dark:border-brand-800 rounded-2xl text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Age</p>
            <p className="text-4xl font-bold text-brand-600">{result.years} <span className="text-2xl">years</span></p>
            <p className="text-lg text-muted-foreground mt-1">{result.months} months, {result.days} days</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Total Days', result.totalDays.toLocaleString()],
              ['Total Weeks', result.totalWeeks.toLocaleString()],
              ['Total Months', result.totalMonths.toLocaleString()],
              ['Total Hours', result.totalHours.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="p-4 bg-muted/30 border border-border rounded-xl text-center">
                <div className="text-lg font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-4 bg-muted/30 border border-border rounded-xl">
              <span className="text-muted-foreground">Born on: </span>
              <span className="font-semibold">{result.dayOfWeek}</span>
            </div>
            <div className="p-4 bg-muted/30 border border-border rounded-xl">
              <span className="text-muted-foreground">Next birthday in: </span>
              <span className="font-semibold">{result.daysToNext} days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
