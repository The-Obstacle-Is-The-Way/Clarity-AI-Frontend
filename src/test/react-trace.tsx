import { useEffect, useState } from 'react';

// Component that monitors render cycles
export function RenderCounter({ componentName }: { componentName: string }) {
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(prev => {
      const newCount = prev + 1;
      console.log(`\x1b[36m[RENDER:${componentName}]\x1b[0m Count: ${newCount}`);
      return newCount;
    });
  });
  
  return null;
}

// Higher-order component to trace state updates
export function withStateTracing<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function TracedComponent(props: P) {
    console.log(`\x1b[36m[RENDER-START:${componentName}]\x1b[0m with props:`, props);
    
    useEffect(() => {
      console.log(`\x1b[36m[MOUNT:${componentName}]\x1b[0m`);
      return () => {
        console.log(`\x1b[36m[UNMOUNT:${componentName}]\x1b[0m`);
      };
    }, []);
    
    const result = <Component {...props} />;
    console.log(`\x1b[36m[RENDER-END:${componentName}]\x1b[0m`);
    return result;
  };
}

// Component to trace any state changes
interface StateTracerProps<T> {
  value: T;
  name: string;
}

export function StateTracer<T>({ value, name }: StateTracerProps<T>) {
  useEffect(() => {
    console.log(`\x1b[32m[STATE-CHANGE:${name}]\x1b[0m`, value);
  }, [value, name]);
  
  return null;
}

// Hook to trace state changes
export function useTracedState<T>(initialValue: T, name: string): [T, (newValue: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  
  const setTracedValue = (newValue: T | ((prev: T) => T)) => {
    console.log(`\x1b[32m[STATE-UPDATE:${name}]\x1b[0m Before:`, value);
    setValue(prevValue => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as ((prev: T) => T))(prevValue) 
        : newValue;
      console.log(`\x1b[32m[STATE-UPDATE:${name}]\x1b[0m After:`, nextValue);
      return nextValue;
    });
  };
  
  // Log initial value on mount
  useEffect(() => {
    console.log(`\x1b[32m[STATE-INIT:${name}]\x1b[0m`, initialValue);
  }, []);
  
  return [value, setTracedValue];
}

// Hook to trace effect executions
export function useTracedEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList | undefined,
  effectName: string
) {
  useEffect(() => {
    console.log(`\x1b[35m[EFFECT-START:${effectName}]\x1b[0m`);
    const cleanup = effect();
    console.log(`\x1b[35m[EFFECT-END:${effectName}]\x1b[0m`);
    
    return () => {
      if (cleanup) {
        console.log(`\x1b[35m[EFFECT-CLEANUP:${effectName}]\x1b[0m`);
        cleanup();
      }
    };
  }, deps);
} 