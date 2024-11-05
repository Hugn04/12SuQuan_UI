function createInput(scene, x, y, config = {}) {
    const _config = {
        type: 'text',
        placeholder: '',
        ...config,
    };
    let element = document.createElement('input');
    element.type = _config.type;
    element.placeholder = _config.placeholder;
    // element.type = 'password';
    element.classList.add('custom-input');
    return scene.add.dom(x, y, element).setOrigin(0.5);
}
export default createInput;
