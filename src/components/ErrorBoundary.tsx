import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-800 rounded-lg" dir="ltr">
          <h2 className="font-bold">Something went wrong.</h2>
          <pre className="text-xs mt-2 overflow-auto">{this.state.error?.toString()}</pre>
          <pre className="text-xs mt-2 overflow-auto">{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
