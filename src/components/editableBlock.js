import React from 'react';
import ContentEditable from "react-contenteditable";

import "./styles.css";
import SelectMenu from "./selectMenu";

import {getCaretCoordinates, setCaretToEnd} from "./utils/caretHelpers";

class EditableBlock extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyUpHandler = this.onKeyUpHandler.bind(this);
        this.openSelectMenuHandler = this.openSelectMenuHandler.bind(this);
        this.closeSelectMenuHandler = this.closeSelectMenuHandler.bind(this);
        this.tagSelectionHandler = this.tagSelectionHandler.bind(this);
        this.onKeyDownHandler = this.onKeyDownHandler.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.contentEditable = React.createRef();
        this.state = {
            htmlBackup: null,
            html: '',
            tag: 'p',
            previousKey: '',
            selectMenuIsOpen: false,
            selectMenuPosition: {
                x: null,
                y: null,
            },
        };
    }

    onKeyUpHandler(e) {
        if(e.key === '/'){
            this.openSelectMenuHandler();
        }
    }

    onKeyDownHandler(e) {
        if(e.key === '/') {
            this.setState({htmlBackup: this.state.html});
        }
        if(e.key === 'Enter') {
            if(this.state.previousKey !== 'Shift' && !this.state.selectMenuIsOpen) {
                e.preventDefault();
                this.props.addBlock({
                    id: this.props.id,
                    ref: this.contentEditable.current,
                });
            }
        }
        if(e.key === 'Backspace' && !this.state.html) {
            e.preventDefault();
            this.props.deleteblock({
                id: this.props.id,
                ref: this.contentEditable.current,
            });
        }
        this.setState({ previousKey: e.key });
    }

    openSelectMenuHandler() {
        const {x, y} = getCaretCoordinates();
        this.setState({
            selectMenuIsOpen: true,
            selectMenuPosition: {x,y},
        });
        document.addEventListener('click', this.closeSelectMenuHandler);
    }

    closeSelectMenuHandler() {
        this.setState({
            htmlBackup: null,
            selectMenuIsOpen: false,
            selectMenuPosition: { x: null, y: null},
        });
        document.removeEventListener('click', this.closeSelectMenuHandler);
    }

    tagSelectionHandler(tag) {
        this.setState({tag: tag, html: this.state.htmlBackup}, () => {
            setCaretToEnd(this.contentEditable.current);
            this.closeSelectMenuHandler();
        });
    }

    componentDidMount() {
        this.setState({ html: this.props.html, tag: this.props.tag });
    }

    componentDidUpdate(prevProps, prevState) {
        const htmlChanged = prevState.html !== this.state.html;
        const tagChanged = prevState.tag !== this.state.tag;
        if(htmlChanged || tagChanged) {
            this.props.updatePage({
                id: this.props.id,
                html: this.state.html,
                tag: this.state.tag,
            });
        }
    }

    onChangeHandler(e) {
        this.setState({ html: e.target.value });
    }

    render() {
        return (
            <>
            {this.state.selectMenuIsOpen && (
                <SelectMenu
                  position={this.state.selectMenuPosition}
                  onSelect={this.tagSelectionHandler}
                  close={this.closeSelectMenuHandler}
                />
            )}
            <ContentEditable
              className="Block"
              innerRef={(ref) => (this.contentEditable=ref)}
              html={this.state.html}
              tagName={this.state.tag}
              onChange={this.onChangeHandler}
              onKeyDown={this.onKeyDownHandler}
              onKeyUp={this.onKeyUpHandler}
            />
            </>
        );
    }
}

export default EditableBlock;