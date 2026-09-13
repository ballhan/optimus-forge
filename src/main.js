import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createOptimus } from './models/optimus.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './style.css';

const viewport = document.querySelector('#viewport');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference:'high-performance' }); }
catch { document.querySelector('#loading').textContent='This study needs WebGL. Please enable hardware acceleration and reload.'; throw new Error('WebGL unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
viewport.appendChild(renderer.domElement);
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
scene.environment = pmrem.fromScene(room, .04).texture;
room.dispose(); pmrem.dispose();
scene.environmentIntensity = .65;
let dirty=true;
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change',()=>{dirty=true;});
controls.enableDamping = true; controls.dampingFactor=.06;
controls.minDistance=5;controls.maxDistance=24;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.25;controls.enablePan=false;controls.autoRotateSpeed=.65;
scene.add(new THREE.HemisphereLight(0xb4d9ff,0x11151e,.35));
function light(color,intensity,pos){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);scene.add(l);return l;}
const key=light(0xffead6,2.5,[4,8,5]);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:10,bottom:-7,near:.1,far:30});key.shadow.normalBias=.025;
light(0x80baff,2.1,[-4,6,-4]);light(0xffffff,1.1,[-4,3,5]);
light(0xff5b35,1.0,[4,3,-3]);
const model=createOptimus();
const {root,parts}=model;scene.add(root);
const mat=(color,metalness=.65,roughness=.3)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const steel=mat('#738398',.9,.3);
function box(parent,size,pos,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);parent.add(m);return m;}
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const occlusion=new SSAOPass(scene,camera,1,1,12);occlusion.kernelRadius=.22;occlusion.minDistance=.003;occlusion.maxDistance=.16;composer.addPass(occlusion);
const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.075,.25,4.0);composer.addPass(bloom);
composer.addPass(new OutputPass());
const antialias=new ShaderPass(FXAAShader);composer.addPass(antialias);
let cinema=true;
document.querySelector('#lighting').addEventListener('click',e=>{cinema=!cinema;dirty=true;occlusion.enabled=bloom.enabled=cinema;e.currentTarget.setAttribute('aria-pressed',cinema);e.currentTarget.title=cinema?'Cinema shading enabled — switch to performance mode':'Performance mode — enable cinema shading';});
const floor=new THREE.Mesh(new THREE.CircleGeometry(18,96),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-.013;floor.receiveShadow=true;scene.add(floor);
const platform=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.58,.10,96),mat('#080e16',.25,.8));platform.position.y=-.075;platform.receiveShadow=true;scene.add(platform);
const ring=new THREE.Mesh(new THREE.TorusGeometry(3.45,.009,6,128),mat('#647f92',.7,.4));ring.rotation.x=Math.PI/2;ring.position.y=-.016;scene.add(ring);
for(let i=0;i<60;i++){const a=i*Math.PI/30;const tick=box(scene,[.012,.004,i%5===0?.12:.05],[Math.sin(a)*3.3,-.018,Math.cos(a)*3.3],steel,.001);tick.rotation.y=a;}

const slider=document.querySelector('#transform'),play=document.querySelector('#play');
let progress=0,target=0,playing=false,direction=1,last=performance.now();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function pose(t){model.pose(t);}
function updateUI(){const percent=Math.round(target*100);slider.value=target*1000;slider.style.setProperty('--progress',`${percent}%`);document.querySelector('#progress').innerHTML=`${percent}<span>%</span>`;const stage=Math.min(3,Math.floor(target*4));document.querySelectorAll('[data-stage]').forEach((el,i)=>el.classList.toggle('active',i===stage));document.querySelector('#phase').textContent=target===0?'Ready to roll out.':target===1?'More than meets the eye.':['Releasing armor locks.','Folding the assemblies.','Bringing it together.','Locking vehicle form.'][stage];document.querySelector('#mode').textContent=target===0?'Robot mode':target===1?'Vehicle mode':'Transformation in progress';document.querySelector('#play-label').textContent=playing?'Pause':target>=.999?'Revert':'Transform';document.querySelector('#play-icon').textContent=playing?'\u2161':'\u25b6';slider.setAttribute('aria-valuetext',`${percent}% transformed`);}
slider.addEventListener('input',()=>{playing=false;target=Number(slider.value)/1000;updateUI();});
play.addEventListener('click',()=>{playing=!playing;if(playing){direction=target>=.999?-1:target<=.001?1:direction;}updateUI();});
document.querySelector('#rotate').addEventListener('click',e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',controls.autoRotate);});
document.querySelector('#wire').addEventListener('click',e=>{dirty=true;const on=e.currentTarget.getAttribute('aria-pressed')!=='true';root.traverse(o=>{if(o.isMesh)o.material.wireframe=on;});e.currentTarget.setAttribute('aria-pressed',on);});
function reset(){const mobile=innerWidth<800;camera.position.set(mobile?8.4:8.4, mobile?5.2:5.7,mobile?14.7:15.1);controls.target.set(0,2.6,0);controls.update();}
document.querySelector('#reset').addEventListener('click',()=>{controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');reset();});
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight,dpr=renderer.getPixelRatio();renderer.setSize(w,h);composer.setSize(w,h);antialias.uniforms.resolution.value.set(1/(w*dpr),1/(h*dpr));occlusion.setSize(Math.ceil(w*dpr*.6),Math.ceil(h*dpr*.6));dirty=true;camera.aspect=w/h;camera.clearViewOffset();if(w>800)camera.setViewOffset(w,h,-w*.135,h*.10,w,h);else camera.setViewOffset(w,h,-w*.025,h*.01,w,h);camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(viewport);reset();resize();updateUI();pose(0);document.querySelector('#loading').remove();
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;const note=document.createElement('div');note.id='loading';note.textContent='Graphics context interrupted. Reload to resume.';viewport.appendChild(note);});
let renderedFrames=0;
function animate(now){
  const dt=Math.min((now-last)/1000,.1);last=now;
  if(playing){target=THREE.MathUtils.clamp(target+dt/8*direction,0,1);if(target===0||target===1)playing=false;updateUI();}
  const previous=progress;
  progress=reduced?target:THREE.MathUtils.damp(progress,target,13,dt);
  if(Math.abs(progress-target)<.0001)progress=target;
  if(previous!==progress){pose(progress);dirty=true;}
  controls.update();
  if(dirty){composer.render();renderedFrames++;dirty=false;}
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
// Read-only diagnostics used to verify each assembled endpoint and the animation.
window.primeStudy={get state(){return{target,progress,playing,renderedFrames,assemblies:parts.length,cinema,model:model.metadata.id,meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};


