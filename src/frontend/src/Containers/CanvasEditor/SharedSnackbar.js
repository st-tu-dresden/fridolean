import { IconButton, Snackbar } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React from 'react';
import { SharedSnackbarConsumer } from './SharedSnackbarProvider';

const SharedSnackbar = () => (
  <SharedSnackbarConsumer>
    {({ snackbarIsOpen, hovermsg, clickmsg, closeSnackbar }) => (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarIsOpen}
        autoHideDuration={60000}
        onClose={closeSnackbar}
        message={<div> 
                    <span>{hovermsg}</span> <br/>
                    <hr/>
                    <span>{clickmsg}</span>
                </div>}
        action={[
          <IconButton key="close" color="inherit" onClick={closeSnackbar}>
            <Close />
          </IconButton>,
        ]}
      />
    )}
  </SharedSnackbarConsumer>
);

export default SharedSnackbar;
