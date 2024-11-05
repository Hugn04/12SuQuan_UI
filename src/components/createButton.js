function createButton(scene, x, y, config = {}) {
    const _config = {
        title: 'Button',
        onClick: () => {},
        classList: [],
        ...config,
    };
    const classList = ['custom-button', ..._config.classList];
    let element = document.createElement('button');
    element.innerText = _config.title;
    classList.forEach((className) => {
        element.classList.add(className);
    });
    element.onclick = _config.onClick;
    return scene.add.dom(x, y, element).setOrigin(0.5);
}
export default createButton;
