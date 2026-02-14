const canvasEl = document.querySelector('#canvas');
const cleanBtn = document.querySelector('.clean-btn');
const mainText = document.querySelector('#birthday-text');
const subText = document.querySelector('#sub-text');

let firstClick = true;
const pointer = { x: 0.5, y: 0.5, clicked: false, vanishCanvas: false };

let shaderMaterial, basicMaterial, renderer, sceneShader, sceneBasic, camera, clock;
let renderTargets = [];

function init() {
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    sceneShader = new THREE.Scene();
    sceneBasic = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    clock = new THREE.Clock();

    renderTargets = [
        new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
        new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
    ];

    createPlane();
    updateSize();
    render();
}

function createPlane() {
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_stop_time: { value: 0 },
            u_global_time: { value: 0 },
            u_stop_randomizer: { value: new THREE.Vector2(Math.random(), Math.random()) },
            u_cursor: { value: new THREE.Vector2(pointer.x, pointer.y) },
            u_ratio: { value: window.innerWidth / window.innerHeight },
            u_texture: { value: null },
            u_clean: { value: 0 },
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
    });

    basicMaterial = new THREE.MeshBasicMaterial();
    const planeGeom = new THREE.PlaneGeometry(2, 2);
    sceneShader.add(new THREE.Mesh(planeGeom, shaderMaterial));
    sceneBasic.add(new THREE.Mesh(planeGeom, basicMaterial));
}

function render() {
    const delta = clock.getDelta();
    shaderMaterial.uniforms.u_clean.value = pointer.vanishCanvas ? 1 : 0;
    shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture;
    shaderMaterial.uniforms.u_global_time.value += delta;

    if (pointer.clicked) {
        if(firstClick) {
            mainText.innerHTML = "¡Feliz Cumpleaños!";
            mainText.style.color = "#ffb7ff";
            subText.innerHTML = "Cada clic es un deseo para ti ✨";
            firstClick = false;
        }
        shaderMaterial.uniforms.u_cursor.value.set(pointer.x, 1 - pointer.y);
        shaderMaterial.uniforms.u_stop_randomizer.value.set(Math.random(), Math.random());
        shaderMaterial.uniforms.u_stop_time.value = 0;
        pointer.clicked = false;
    }

    shaderMaterial.uniforms.u_stop_time.value += delta;

    renderer.setRenderTarget(renderTargets[1]);
    renderer.render(sceneShader, camera);

    basicMaterial.map = renderTargets[1].texture;
    renderer.setRenderTarget(null);
    renderer.render(sceneBasic, camera);

    let tmp = renderTargets[0];
    renderTargets[0] = renderTargets[1];
    renderTargets[1] = tmp;

    requestAnimationFrame(render);
}

function updateSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    renderTargets[0].setSize(w, h);
    renderTargets[1].setSize(w, h);
    shaderMaterial.uniforms.u_ratio.value = w / h;
}

const handleInput = (e) => {
    const x = e.pageX || (e.touches && e.touches[0].pageX);
    const y = e.pageY || (e.touches && e.touches[0].pageY);
    pointer.x = x / window.innerWidth;
    pointer.y = y / window.innerHeight;
    pointer.clicked = true;
};

window.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', handleInput);
window.addEventListener('resize', updateSize);
cleanBtn.addEventListener('click', () => {
    pointer.vanishCanvas = true;
    setTimeout(() => { pointer.vanishCanvas = false; }, 150);
});

init();