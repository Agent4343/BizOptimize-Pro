"use client";

import { useEffect, useState } from "react";

export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export interface OnboardingState {
  status: OnboardingStatus;
  companyName: string;
  teamSize: string;
  focusModule: "construction" | "trucking" | "restaurant" | "";
  primaryGoal: string;
}

const defaultState: OnboardingState = {
  status: "not_started",
  companyName: "",
  teamSize: "",
  focusModule: "",
  primaryGoal: "",
};

const STORAGE_KEY = "bizoptimize:onboarding";

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === "undefined") {
      return defaultState;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) } as OnboardingState;
      }
    } catch (error) {
      console.warn("[onboarding] failed to parse storage", error);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("[onboarding] failed to persist", error);
    }
  }, [state]);

  const updateState = (next: Partial<OnboardingState>) => {
    setState((previous) => ({
      ...previous,
      ...next,
      status: next.status ?? previous.status,
    }));
  };

  const start = () => {
    setState((previous) => ({ ...previous, status: "in_progress" }));
  };

  const complete = (payload: Partial<OnboardingState>) => {
    setState((previous) => ({
      ...previous,
      ...payload,
      status: "completed",
    }));
  };

  const reset = () => {
    setState(defaultState);
  };

  return {
    state,
    updateState,
    start,
    complete,
    reset,
  };
}
