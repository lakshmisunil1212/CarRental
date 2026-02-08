import React from "react";

/* Basic error boundary — wrap top-level components if desired */
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() {
    if (this.state.hasError) {
      return <div className="bg-red-50 p-6 rounded">Something went wrong. Try reloading.</div>;
    }
    return this.props.children;
  }
}