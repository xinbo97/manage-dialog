import React, {  Component } from 'react';
import ReactDOM from 'react-dom';

const queue = [];

function CreateModal(configs) {
    let  modal, wrapper;

    const addStyle=(portalStyles,portalEle)=>{
        if((portalStyles instanceof Object)&&Object.keys(portalStyles).length){
            for (let idx = 0; idx < Object.keys(portalStyles).length; idx++) {
                portalEle.style[Object.keys(portalStyles)[idx]]=Object.values(portalStyles)[idx]
            }
        }
    }

    let div = document.createElement('div');
    addStyle(configs.portalStyles,div)
    document.body.appendChild(div);

    const close = async() => {
        wrapper.onLeave();
        return;
    };

    queue.push(close);

    const destroy = (resolve, reject, resolved, output) => {
        if (div) {
            ReactDOM.unmountComponentAtNode(div);
            if (div&&div.parentNode) {
                div.parentNode.removeChild(div);
                div = null;
            }

            const idx = queue.indexOf(close);
            if (idx !== -1) queue.splice(idx, 1);
            if (resolved) {
                resolve && resolve(output);
            } else {
                reject && reject(output);
            }
        }
    };

    class CreatedModal extends Component {
        constructor(props) {
            super(props);
        }

        onLeave() {
            const { leaveProp: { resolve, reject } } = this.props;
            destroy(resolve, reject, false, null);
        }

        render() {
            const { component: DefaultModal, defaultProps, customProps ,defaultConfigs } = this.props;
            return (
                // defaultProps：用来传默认样式、footer、标题等一些通用配置
                React.createElement(DefaultModal, { ...customProps,...defaultConfigs,defaultProps })
            );
        }
    }

    const createModalPromise = (resolve, reject) => {
        // customProps：自定义属性；component外部组件；defaultProps组件默认配置
        const { customProps, component,defaultProps } = configs;
        const defaultConfigs = {
            promise: {
                resolve(data) {
                    destroy(resolve, reject, true, data);
                },
                reject(error) {
                    destroy(resolve, reject, false, error);
                }
            }
        };
        
        modal = (
            React.createElement(CreatedModal, {ref: ref => wrapper = ref,component,defaultConfigs,leaveProp: { resolve, reject },customProps,defaultProps})
        );
        ReactDOM.render(modal, div);
    };

    this.open = () => {
        const promise = new Promise(createModalPromise);
        promise.close = close;
        return promise;
    };
}

export default  {
    open(config) {
    const instance = new CreateModal(config);
    return instance.open();
},
    async closeAll() {
        while (queue.length) {
            await queue[0]();
        }
}};