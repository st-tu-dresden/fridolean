import React, { Component } from 'react';
import  SharedSnackbar from './SharedSnackbar';

const SharedSnackbarContext = React.createContext();

export class SharedSnackbarProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      hoverText: '',
      clickText: '',
    };
  }

  openSnackbar = (hoverText, clickText) => {
    this.setState({
      hoverText,
      clickText,
      isOpen: true,
    });
  };

  closeSnackbar = () => {
    this.setState({
      hoverText: '',
      clickText: '',
      isOpen: false,
    });
  };

  render() {
    const { children } = this.props;

    return (
      <SharedSnackbarContext.Provider
        value={{
          openSnackbar: this.openSnackbar,
          closeSnackbar: this.closeSnackbar,
          snackbarIsOpen: this.state.isOpen,
          hovermsg: this.state.hoverText,
          clickmsg: this.state.clickText,
        }}
      >
        <SharedSnackbar />
        {children}
      </SharedSnackbarContext.Provider>
    );
  }
}

export const SharedSnackbarConsumer = SharedSnackbarContext.Consumer;