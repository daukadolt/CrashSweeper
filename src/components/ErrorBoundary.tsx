import React from 'react';
import CrashPage from './CrashPage';

class ErrorBoundary extends React.Component<{
  children: React.ReactNode
}, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {

    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can log error here
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <CrashPage />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 