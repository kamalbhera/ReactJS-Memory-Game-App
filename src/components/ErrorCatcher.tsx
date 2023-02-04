import React from "react";

class ErrorCatcher extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { error: false };
  }

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return (
        <React.Fragment>
          <h1>Something went wrong</h1>
          <span>
            If the error persists, please reach out to allmail.anirban@gmail.com
          </span>
        </React.Fragment>
      );
    }

    return this.props.children;
  }
}

export default ErrorCatcher;
