'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
export default function ThreeBellInner(){
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ const mount=ref.current!; const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(45,1,0.1,100); camera.position.z=3;
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setSize(40,40); mount.appendChild(renderer.domElement);
    const geo=new THREE.SphereGeometry(1,16,16); const mat=new THREE.MeshStandardMaterial({color:0xffc107,metalness:0.8,roughness:0.2}); const mesh=new THREE.Mesh(geo,mat); scene.add(mesh); scene.add(new THREE.AmbientLight(0xffffff,0.8));
    let r=0; const tick=()=>{ mesh.rotation.y+=0.02; r=requestAnimationFrame(tick); renderer.render(scene,camera); }; tick();
    return ()=>{ cancelAnimationFrame(r); renderer.dispose(); mount.innerHTML=''; };
  },[]);
  return <div ref={ref} className="size-10 md:size-12"/>;
}
