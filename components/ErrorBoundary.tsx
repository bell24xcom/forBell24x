'use client';
import React from 'react';
type Props = { children: React.ReactNode; fallback?: React.ReactNode };
export class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props){ super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(){ return { hasError: true }; }
  render(){ return this.state.hasError ? (this.props.fallback ?? null) : this.props.children; }
}
