"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OnboardingState } from "@/lib/onboarding-store";

const steps = [
  { id: "welcome", title: "Welcome", description: "Quickly align BizOptimize to your workspace." },
  { id: "company", title: "Company", description: "Tell us about your team." },
  { id: "focus", title: "Focus", description: "Pick the module you’ll launch first." },
  { id: "finish", title: "Next steps", description: "We’ll suggest what to do next." },
];

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  initialState: OnboardingState;
  onComplete: (payload: Partial<OnboardingState>) => void;
}

export function OnboardingWizard({ open, onClose, initialState, onComplete }: OnboardingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [companyName, setCompanyName] = useState(initialState.companyName);
  const [teamSize, setTeamSize] = useState(initialState.teamSize);
  const [focusModule, setFocusModule] = useState<OnboardingState["focusModule"]>(initialState.focusModule);
  const [primaryGoal, setPrimaryGoal] = useState(initialState.primaryGoal);

  const goNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((index) => index + 1);
    } else {
      onComplete({
        companyName,
        teamSize,
        focusModule,
        primaryGoal,
      });
      onClose();
      setStepIndex(0);
    }
  };

  const goBack = () => {
    if (stepIndex === 0) {
      onClose();
      return;
    }
    setStepIndex((index) => Math.max(0, index - 1));
  };

  if (!open) {
    return null;
  }

  const currentStep = steps[stepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <Card className="w-full max-w-3xl border border-white/10 bg-white/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Onboarding</p>
              <CardTitle>{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </div>
            <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">
              Skip
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn("h-1 flex-1 rounded-full bg-slate-200", index <= stepIndex && "bg-slate-900")}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep.id === "welcome" && (
            <div className="space-y-4 text-slate-700">
              <p className="text-lg font-semibold text-slate-900">Let’s tailor BizOptimize in under a minute.</p>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                <li>Capture company context once—agents reference it automatically.</li>
                <li>Get recommended templates for construction, trucking, or restaurants.</li>
                <li>Unlock export-ready decks without retyping client info.</li>
              </ul>
            </div>
          )}

          {currentStep.id === "company" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company name</label>
                <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Atlantic Construction Ltd." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Team size</label>
                <Input value={teamSize} onChange={(event) => setTeamSize(event.target.value)} placeholder="10 estimators" />
              </div>
            </div>
          )}

          {currentStep.id === "focus" && (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { value: "construction", label: "Construction" },
                { value: "trucking", label: "Trucking" },
                { value: "restaurant", label: "Restaurant" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    focusModule === option.value ? "border-slate-900 bg-slate-900/5" : "border-slate-200 hover:border-slate-900",
                  )}
                  onClick={() => setFocusModule(option.value as OnboardingState["focusModule"])}
                >
                  <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                  <p className="text-xs text-slate-500">Recommend templates + exports</p>
                </button>
              ))}
              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium text-slate-700">Primary goal</label>
                <Input
                  value={primaryGoal}
                  onChange={(event) => setPrimaryGoal(event.target.value)}
                  placeholder="e.g. Quote EV-ready garages faster"
                />
              </div>
            </div>
          )}

          {currentStep.id === "finish" && (
            <div className="space-y-4 text-slate-700">
              <p className="text-lg font-semibold text-slate-900">You’re all set.</p>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                <li>Dashboard highlights onboarding completion + recommended modules.</li>
                <li>Command palette understands your focus module immediately.</li>
                <li>Exports prefill company and goal context.</li>
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={goBack}>
              {stepIndex === 0 ? "Cancel" : "Back"}
            </Button>
            <Button onClick={goNext}>{stepIndex === steps.length - 1 ? "Finish" : "Next"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
