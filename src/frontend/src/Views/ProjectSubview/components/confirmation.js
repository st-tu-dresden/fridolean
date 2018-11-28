import React from 'react';
import { Modal, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class ConfirmationModal extends React.Component {
    cancel() {
        if (this.props.onCancel != null) {
            this.props.onCancel();
        }
    }
    confirm() {
        if (this.props.onConfirm != null) {
            this.props.onConfirm();
        }
    }
    render() {
        let
            negative = true,
            positive = true,
            inverted = true,
            basic = true;

        return (
            <Modal
                trigger={this.props.trigger}
                basic
                header={{
                    className: "ui",
                    children: [
                        <Icon key="header_icon" name={ this.props.icon || "warning" }/>,
                        <div key="header_content" className="content">{ this.props.header || "Confirm" }</div>,
                    ],
                }}
                content={
                    <div className="content">{
                        this.props.content || "Please confirm your action"
                    }</div>
                }
                actions={[
                    { key: "neg", negative, inverted, basic, onClick: () => this.cancel(),  content: "No"},
                    { key: "pos", positive, inverted, basic, onClick: () => this.confirm(), content: "Yes"}
                ]}
                onClose={(e,d) => {
                    if (e.target instanceof HTMLButtonElement) {
                        // Click already handled
                        return;
                    }
                    this.cancel();
                }}
            />
        );
    }
}

ConfirmationModal.propTypes = {
    trigger: PropTypes.element,
    icon: PropTypes.string,
    content: PropTypes.node,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
}

export default ConfirmationModal;