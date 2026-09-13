import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Lets any screen with its own fixed bottom UI (a chat input dock, a sticky
// CTA, etc.) tell the floating AI Assistant button how much space to clear
// above it — instead of the button hardcoding a list of route names it
// happens to know about. A screen opts in with useFabClearance(height) in a
// plain useEffect; unmounting (navigating away) automatically hands the
// value back to whichever screen is now on top, and to 0 if none claims it.
const FabClearanceContext = createContext<{
  clearance: number;
  claim: (id: string, height: number) => void;
  release: (id: string) => void;
} | undefined>(undefined);

export const FabClearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clearance, setClearance] = useState(0);
  // Multiple screens can claim a value across a fast navigation transition
  // (the outgoing screen's cleanup can fire after the incoming screen's
  // effect) — keeping every active claim and taking the max avoids a
  // momentary flash back to 0 mid-transition.
  const claimsRef = useRef<Map<string, number>>(new Map());

  const recompute = () => {
    const values = Array.from(claimsRef.current.values());
    setClearance(values.length ? Math.max(...values) : 0);
  };

  const claim = (id: string, height: number) => {
    claimsRef.current.set(id, height);
    recompute();
  };
  const release = (id: string) => {
    claimsRef.current.delete(id);
    recompute();
  };

  return (
    <FabClearanceContext.Provider value={{ clearance, claim, release }}>
      {children}
    </FabClearanceContext.Provider>
  );
};

// Read-only — used by AIAssistantWidget.
export const useFabClearanceValue = (): number => {
  const ctx = useContext(FabClearanceContext);
  return ctx?.clearance ?? 0;
};

// Called by a screen that has its own fixed bottom UI the FAB needs to sit
// above. Pass 0 (or omit) to release without claiming anything.
export const useFabClearance = (height: number) => {
  const ctx = useContext(FabClearanceContext);
  const idRef = useRef(`fab-clearance-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!ctx) return;
    const id = idRef.current;
    if (height > 0) {
      ctx.claim(id, height);
    }
    return () => ctx.release(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);
};
