import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import * as THREE from 'three';
import { WebView } from 'react-native-webview';
import { Architecture3D, SquadLocationData } from '../../types/map';

interface Tactical3DCanvasProps {
  architecture?: Architecture3D;
  is3DMode?: boolean;
  zoomLevel?: number;
  walkthroughActive?: boolean;
  onToggleWalkthrough?: () => void;
  squadData?: SquadLocationData | null;
}

const DEFAULT_ARCHITECTURE: Architecture3D = {
  dimensions: { clearanceMeters: 3.2, widthMeters: 24, lengthMeters: 26, totalAreaSqMeters: 624 },
  rooms: [
    { id: 'r1', name: 'Command HQ', code: 'SEC-A1', type: 'COMMAND', bounds: { x: -2, z: -1, width: 12, depth: 10 }, color: '#10B981', clearance: 3.5 },
    { id: 'r2', name: 'Briefing Bay', code: 'SEC-A2', type: 'BRIEFING', bounds: { x: -10, z: -1, width: 7, depth: 10 }, color: '#3B82F6', clearance: 3.2 },
    { id: 'r3', name: 'Server Vault', code: 'SEC-B1', type: 'SERVER', bounds: { x: -10, z: -9, width: 7, depth: 7 }, color: '#8B5CF6', clearance: 3.0 },
    { id: 'r4', name: 'Armory Depot', code: 'SEC-B2', type: 'ARMORY', bounds: { x: -2, z: -9, width: 6, depth: 7 }, color: '#EF4444', clearance: 3.2 },
    { id: 'r5', name: 'Sensor Lab', code: 'SEC-B3', type: 'SENSOR', bounds: { x: 5, z: -9, width: 6, depth: 7 }, color: '#06B6D4', clearance: 3.2 },
    { id: 'r6', name: 'Main Corridor', code: 'CORR-01', type: 'CORRIDOR', bounds: { x: -10, z: 9.5, width: 21, depth: 2.8 }, color: '#64748B', clearance: 3.2 },
    { id: 'r7', name: 'Ingress Portal', code: 'GATE-01', type: 'ENTRY', bounds: { x: -2, z: 5, width: 6, depth: 4 }, color: '#F59E0B', clearance: 3.2 },
    { id: 'r8', name: 'Extraction LZ', code: 'EXT-01', type: 'EXTRACTION', bounds: { x: 5, z: 5, width: 6, depth: 4 }, color: '#10B981', clearance: 4.5 },
  ],
  walls: [
    { id: 'w1', x: 0.5, y: 1.6, z: -13, width: 23, height: 3.2, depth: 0.4 },
    { id: 'w2', x: -5, y: 1.6, z: 11.2, width: 12, height: 3.2, depth: 0.4 },
    { id: 'w3', x: 6, y: 1.6, z: 11.2, width: 8, height: 3.2, depth: 0.4 },
    { id: 'w4', x: -11.2, y: 1.6, z: -0.9, width: 0.4, height: 3.2, depth: 24 },
    { id: 'w5', x: 11.2, y: 1.6, z: -0.9, width: 0.4, height: 3.2, depth: 24 },
    { id: 'w6', x: -6.5, y: 1.6, z: -5.5, width: 9, height: 3.2, depth: 0.4 },
    { id: 'w7', x: 4.5, y: 1.6, z: -5.5, width: 9, height: 3.2, depth: 0.4 },
    { id: 'w8', x: -6.5, y: 1.6, z: 4.2, width: 9, height: 3.2, depth: 0.4 },
    { id: 'w9', x: 5.5, y: 1.6, z: 4.2, width: 7, height: 3.2, depth: 0.4 },
    { id: 'w10', x: -2.8, y: 1.6, z: -1, width: 0.4, height: 3.2, depth: 10 },
    { id: 'w11', x: 4.2, y: 1.6, z: -9, width: 0.4, height: 3.2, depth: 7 },
    { id: 'w12', x: 1.8, y: 1.6, z: 5, width: 0.4, height: 3.2, depth: 4 },
  ],
  tacticalMarkers: [
    { id: 'm1', label: 'Alpha Target', type: 'OBJECTIVE', position: { x: 3.5, y: 1.6, z: 3.5 }, color: '#EF4444' },
    { id: 'm2', label: 'Extraction Zone', type: 'EXTRACTION', position: { x: 7.5, y: 0.6, z: 6.5 }, color: '#10B981' },
    { id: 'm3', label: 'Breach Alpha', type: 'BREACH', position: { x: 0.5, y: 1.2, z: 11.2 }, color: '#F59E0B' },
  ],
};

// Generates self-contained HTML for Native WebView WebGL 3D rendering
const generateNativeThreeHtml = (
  arch: Architecture3D,
  autoRotate: boolean,
  cameraMode: string,
  isWireframe: boolean
) => {
  const serializedArch = JSON.stringify(arch);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #050E08;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    #three-canvas {
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
    }
    #loader {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #050E08;
      color: #10B981;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      z-index: 20;
      transition: opacity 0.35s ease;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 2.5px solid rgba(16, 185, 129, 0.2);
      border-top-color: #10B981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
</head>
<body>
  <div id="loader">
    <div class="spinner"></div>
    <span>3D SPATIAL MODEL INITIALIZING...</span>
  </div>
  <div id="canvas-container">
    <canvas id="three-canvas"></canvas>
  </div>
  <script>
    (function() {
      var arch = ${serializedArch};
      var autoRotate = ${autoRotate};
      var cameraMode = '${cameraMode}';
      var isWireframe = ${isWireframe};

      var container = document.getElementById('canvas-container');
      var canvas = document.getElementById('three-canvas');
      var loader = document.getElementById('loader');

      function hideLoader() {
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(function() { loader.style.display = 'none'; }, 350);
        }
      }

      if (typeof THREE === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
        script.onload = initScene;
        script.onerror = function() {
          if (loader) loader.innerHTML = '<span style="color: #EF4444;">Could not load 3D engine</span>';
        };
        document.head.appendChild(script);
      } else {
        initScene();
      }

      function initScene() {
        try {
          var width = container.clientWidth || window.innerWidth || 360;
          var height = container.clientHeight || window.innerHeight || 390;

          var scene = new THREE.Scene();
          scene.background = new THREE.Color(0x050e08);
          scene.fog = new THREE.FogExp2(0x050e08, 0.018);

          var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
          var renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
          });
          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;

          // Lighting
          var ambientLight = new THREE.AmbientLight(0x0d2818, 2.2);
          scene.add(ambientLight);

          var sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
          sunLight.position.set(20, 40, 15);
          sunLight.castShadow = true;
          scene.add(sunLight);

          var greenFillLight = new THREE.DirectionalLight(0x10b981, 1.4);
          greenFillLight.position.set(-20, 20, -15);
          scene.add(greenFillLight);

          var centerPointLight = new THREE.PointLight(0x34d399, 2.0, 30);
          centerPointLight.position.set(0, 6, 0);
          scene.add(centerPointLight);

          // Ground Grid & Slab
          var gridHelper = new THREE.GridHelper(60, 40, 0x10b981, 0x143522);
          gridHelper.position.y = -0.01;
          scene.add(gridHelper);

          var floorGeo = new THREE.PlaneGeometry(36, 36);
          var floorMat = new THREE.MeshStandardMaterial({
            color: 0x091710,
            roughness: 0.8,
            metalness: 0.3
          });
          var floorMesh = new THREE.Mesh(floorGeo, floorMat);
          floorMesh.rotation.x = -Math.PI / 2;
          floorMesh.receiveShadow = true;
          scene.add(floorMesh);

          var orbitGroup = new THREE.Group();
          scene.add(orbitGroup);

          var wallsGroup = new THREE.Group();
          orbitGroup.add(wallsGroup);

          var beaconsGroup = new THREE.Group();
          orbitGroup.add(beaconsGroup);
          var pulseRings = [];

          function buildArchitecture(a) {
            while (wallsGroup.children.length > 0) {
              wallsGroup.remove(wallsGroup.children[0]);
            }
            while (beaconsGroup.children.length > 0) {
              beaconsGroup.remove(beaconsGroup.children[0]);
            }
            pulseRings = [];

            // A. Rooms Floor Zones
            var rooms = (a && a.rooms && a.rooms.length > 0) ? a.rooms : [];
            rooms.forEach(function(room) {
              var rw = room.bounds.width;
              var rd = room.bounds.depth;
              var rx = room.bounds.x + rw / 2;
              var rz = room.bounds.z + rd / 2;

              var roomFloorGeo = new THREE.PlaneGeometry(rw - 0.2, rd - 0.2);
              var roomFloorMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(room.color || '#10B981'),
                roughness: 0.6,
                metalness: 0.2,
                transparent: true,
                opacity: 0.18
              });
              var rMesh = new THREE.Mesh(roomFloorGeo, roomFloorMat);
              rMesh.rotation.x = -Math.PI / 2;
              rMesh.position.set(rx, 0.02, rz);
              rMesh.receiveShadow = true;
              wallsGroup.add(rMesh);

              var borderEdges = new THREE.EdgesGeometry(roomFloorGeo);
              var borderMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(room.color || '#10B981'),
                transparent: true,
                opacity: 0.6
              });
              var borderLine = new THREE.LineSegments(borderEdges, borderMat);
              borderLine.rotation.x = -Math.PI / 2;
              borderLine.position.set(rx, 0.03, rz);
              wallsGroup.add(borderLine);
            });

            // B. Extruded Walls
            var wallMaterial = new THREE.MeshStandardMaterial({
              color: 0x142b1d,
              roughness: 0.35,
              metalness: 0.65,
              wireframe: isWireframe
            });
            var edgeMaterial = new THREE.LineBasicMaterial({
              color: 0x34d399,
              linewidth: 1.5
            });

            var walls = (a && a.walls && a.walls.length > 0) ? a.walls : [];
            walls.forEach(function(w) {
              var wallGeo = new THREE.BoxGeometry(w.width, w.height, w.depth);
              var wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
              wallMesh.position.set(w.x, w.y, w.z);
              wallMesh.castShadow = true;
              wallMesh.receiveShadow = true;
              wallsGroup.add(wallMesh);

              var edges = new THREE.EdgesGeometry(wallGeo);
              var edgeLine = new THREE.LineSegments(edges, edgeMaterial);
              edgeLine.position.set(w.x, w.y, w.z);
              wallsGroup.add(edgeLine);
            });

            // C. Tactical Assets (Holo Table, Racks) placed dynamically inside detected rooms
            if (rooms && rooms.length > 0) {
              var cmdRoom = rooms[0];
              var cx = cmdRoom.bounds.x + cmdRoom.bounds.width / 2;
              var cz = cmdRoom.bounds.z + cmdRoom.bounds.depth / 2;

              var holoTableBaseGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.6, 16);
              var holoTableBaseMat = new THREE.MeshStandardMaterial({ color: 0x0a1f13, metalness: 0.8, roughness: 0.2 });
              var holoTableBase = new THREE.Mesh(holoTableBaseGeo, holoTableBaseMat);
              holoTableBase.position.set(cx, 0.3, cz);
              wallsGroup.add(holoTableBase);

              var holoRingGeo = new THREE.TorusGeometry(0.9, 0.06, 8, 24);
              var holoRingMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
              var holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
              holoRing.rotation.x = Math.PI / 2;
              holoRing.position.set(cx, 0.62, cz);
              wallsGroup.add(holoRing);

              if (rooms.length > 1) {
                var sRoom = rooms[1];
                var sx = sRoom.bounds.x + sRoom.bounds.width / 2;
                var sz = sRoom.bounds.z + sRoom.bounds.depth / 2;
                for (var i = 0; i < 2; i++) {
                  var rackGeo = new THREE.BoxGeometry(0.6, 2.0, 1.0);
                  var rackMat = new THREE.MeshStandardMaterial({ color: 0x09140e, roughness: 0.5 });
                  var rackMesh = new THREE.Mesh(rackGeo, rackMat);
                  rackMesh.position.set(sx - 0.7 + i * 1.4, 1.0, sz);
                  wallsGroup.add(rackMesh);
                }
              }
            }

            // D. Tactical Beacons (With 10s Green-to-Red Alert Timer)
            var alertMaterials = [];
            var markers = (a && a.tacticalMarkers && a.tacticalMarkers.length > 0) ? a.tacticalMarkers : [];
            markers.forEach(function(marker) {
              var beaconSubGroup = new THREE.Group();
              beaconSubGroup.position.set(marker.position.x, marker.position.y, marker.position.z);
              beaconsGroup.add(beaconSubGroup);

              var isAlertMarker = (marker.color === '#EF4444' || marker.id === 'marker-server-vault' || marker.type === 'OBJECTIVE');
              var initialHex = isAlertMarker ? 0x10b981 : (marker.color || '#10B981');
              var color = new THREE.Color(initialHex);

              var diamondGeo = new THREE.OctahedronGeometry(0.48, 0);
              var diamondMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.6,
                roughness: 0.2
              });
              var diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
              diamondMesh.position.y = 0;
              beaconSubGroup.add(diamondMesh);

              var lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.7 });
              var linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -marker.position.y + 0.05, 0)];
              var lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
              var verticalLine = new THREE.Line(lineGeo, lineMat);
              beaconSubGroup.add(verticalLine);

              var ringGeo = new THREE.RingGeometry(0.4, 0.7, 24);
              var ringMat = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
              });
              var pulseRing = new THREE.Mesh(ringGeo, ringMat);
              pulseRing.rotation.x = Math.PI / 2;
              pulseRing.position.set(marker.position.x, 0.05, marker.position.z);
              beaconsGroup.add(pulseRing);
              pulseRings.push(pulseRing);

              if (isAlertMarker) {
                alertMaterials.push({ mat: diamondMat, hasEmissive: true });
                alertMaterials.push({ mat: lineMat });
                alertMaterials.push({ mat: ringMat });
              }
            });
          }

          buildArchitecture(arch);

          // 10-Second Transition: Turns Green Beacon RED after 10 seconds
          setTimeout(function() {
            var redColor = new THREE.Color(0xef4444);
            alertMaterials.forEach(function(item) {
              if (item.mat && item.mat.color) item.mat.color.copy(redColor);
              if (item.hasEmissive && item.mat && item.mat.emissive) item.mat.emissive.copy(redColor);
              if (item.mat) item.mat.needsUpdate = true;
            });
          }, 10000);

          // Camera parameters
          var cameraAngle = Math.PI * 0.25;
          var cameraElevation = Math.PI * 0.28;
          var cameraDistance = 32;
          var isDragging = false;
          var previousPointerPosition = { x: 0, y: 0 };
          var walkthroughPathIndex = 0;

          function sendHudUpdate() {
            var deg = Math.round(((-cameraAngle * 180) / Math.PI) % 360);
            var pitch = Math.round((cameraElevation * 180) / Math.PI);
            deg = deg < 0 ? deg + 360 : deg;
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'HUD_UPDATE',
                azimuth: deg,
                pitch: pitch
              }));
            }
          }

          var initialPinchDist = null;
          var initialCamDist = null;

          function onPointerDown(clientX, clientY) {
            isDragging = true;
            previousPointerPosition = { x: clientX, y: clientY };
          }

          function onPointerMove(clientX, clientY) {
            if (!isDragging) return;
            var deltaX = clientX - previousPointerPosition.x;
            var deltaY = clientY - previousPointerPosition.y;
            previousPointerPosition = { x: clientX, y: clientY };

            cameraAngle -= deltaX * 0.008;
            cameraElevation = Math.max(0.1, Math.min(Math.PI * 0.46, cameraElevation + deltaY * 0.008));
            sendHudUpdate();
          }

          function onPointerUp() {
            isDragging = false;
          }

          canvas.addEventListener('mousedown', function(e) { onPointerDown(e.clientX, e.clientY); });
          window.addEventListener('mousemove', function(e) { onPointerMove(e.clientX, e.clientY); });
          window.addEventListener('mouseup', onPointerUp);

          canvas.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
              onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2) {
              isDragging = false;
              var dx = e.touches[0].clientX - e.touches[1].clientX;
              var dy = e.touches[0].clientY - e.touches[1].clientY;
              initialPinchDist = Math.sqrt(dx * dx + dy * dy);
              initialCamDist = cameraDistance;
            }
          }, { passive: false });

          canvas.addEventListener('touchmove', function(e) {
            if (e.touches.length === 1 && isDragging) {
              onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2 && initialPinchDist) {
              var dx = e.touches[0].clientX - e.touches[1].clientX;
              var dy = e.touches[0].clientY - e.touches[1].clientY;
              var dist = Math.sqrt(dx * dx + dy * dy);
              var factor = initialPinchDist / Math.max(1, dist);
              cameraDistance = Math.max(14, Math.min(52, initialCamDist * factor));
            }
            e.preventDefault();
          }, { passive: false });

          canvas.addEventListener('touchend', function(e) {
            if (e.touches.length === 0) {
              onPointerUp();
              initialPinchDist = null;
            }
          });

          // Main Animation Loop
          var clock = new THREE.Clock();
          function animate() {
            requestAnimationFrame(animate);
            var elapsed = clock.getElapsedTime();

            if (autoRotate && !isDragging && cameraMode === 'orbit') {
              cameraAngle += 0.006;
              sendHudUpdate();
            }

            if (cameraMode === 'orbit') {
              camera.position.x = cameraDistance * Math.sin(cameraAngle) * Math.cos(cameraElevation);
              camera.position.y = cameraDistance * Math.sin(cameraElevation);
              camera.position.z = cameraDistance * Math.cos(cameraAngle) * Math.cos(cameraElevation);
              camera.lookAt(0, 1.2, 0);
            } else if (cameraMode === 'topdown') {
              camera.position.set(0, cameraDistance * 1.1, 0.001);
              camera.lookAt(0, 0, 0);
            } else if (cameraMode === 'walkthrough') {
              walkthroughPathIndex += 0.008;
              var t = walkthroughPathIndex;
              var r = 9.0;
              var cx = Math.sin(t * 0.4) * r;
              var cz = Math.cos(t * 0.4) * (r * 0.8);
              var tx = Math.sin(t * 0.4 + 0.3) * r;
              var tz = Math.cos(t * 0.4 + 0.3) * (r * 0.8);
              camera.position.set(cx, 1.6, cz);
              camera.lookAt(tx, 1.6, tz);
            }

            if (beaconsGroup && beaconsGroup.children) {
              beaconsGroup.children.forEach(function(child, idx) {
                if (child.children && child.children[0]) {
                  child.children[0].position.y = Math.sin(elapsed * 3 + idx) * 0.18;
                  child.children[0].rotation.y += 0.02;
                }
              });
            }

            pulseRings.forEach(function(ring, idx) {
              var s = 1 + (Math.sin(elapsed * 2.5 + idx) + 1) * 0.4;
              ring.scale.set(s, s, 1);
            });

            renderer.render(scene, camera);
          }
          animate();
          hideLoader();

          window.addEventListener('resize', function() {
            var newW = container.clientWidth || window.innerWidth;
            var newH = container.clientHeight || window.innerHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
          });

          // React Native Bridge Message Listener
          function handleInboundMessage(raw) {
            try {
              var msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
              if (msg.type === 'SET_AUTO_ROTATE') {
                autoRotate = !!msg.value;
              } else if (msg.type === 'SET_CAMERA_MODE') {
                cameraMode = msg.value;
                if (cameraMode === 'orbit') autoRotate = true;
                else autoRotate = false;
              } else if (msg.type === 'TOGGLE_WIREFRAME') {
                isWireframe = !isWireframe;
                wallsGroup.traverse(function(child) {
                  if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                      child.material.forEach(function(m) { m.wireframe = isWireframe; });
                    } else {
                      child.material.wireframe = isWireframe;
                    }
                  }
                });
              } else if (msg.type === 'ZOOM_IN') {
                cameraDistance = Math.max(14, cameraDistance - 4);
              } else if (msg.type === 'ZOOM_OUT') {
                cameraDistance = Math.min(52, cameraDistance + 4);
              } else if (msg.type === 'RESET_CAMERA') {
                cameraAngle = Math.PI * 0.25;
                cameraElevation = Math.PI * 0.28;
                cameraDistance = 32;
                cameraMode = 'orbit';
                autoRotate = true;
                sendHudUpdate();
              } else if (msg.type === 'SET_ZOOM_LEVEL') {
                if (msg.value) {
                  cameraDistance = Math.max(16, Math.min(48, 32 / msg.value));
                }
              } else if (msg.type === 'UPDATE_ARCHITECTURE') {
                if (msg.architecture) {
                  buildArchitecture(msg.architecture);
                }
              }
            } catch(err) {}
          }

          window.addEventListener('message', function(e) { handleInboundMessage(e.data); });
          document.addEventListener('message', function(e) { handleInboundMessage(e.data); });

        } catch (e) {
          console.error(e);
          if (loader) {
            loader.innerHTML = '<span style="color: #EF4444;">WebGL Render Error</span>';
          }
        }
      }
    })();
  </script>
</body>
</html>`;
};

export const Tactical3DCanvas: React.FC<Tactical3DCanvasProps> = ({
  architecture,
  is3DMode = true,
  zoomLevel = 1,
  walkthroughActive = false,
  onToggleWalkthrough,
  squadData,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webViewRef = useRef<WebView | null>(null);

  const activeArch = architecture || DEFAULT_ARCHITECTURE;

  // Interaction & Animation states
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'walkthrough' | 'topdown'>('orbit');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showDoorDistances, setShowDoorDistances] = useState<boolean>(true);
  const [azimuthAngle, setAzimuthAngle] = useState<number>(45);
  const [pitchAngle, setPitchAngle] = useState<number>(38);

  const autoRotateRef = useRef<boolean>(autoRotate);
  const cameraModeRef = useRef<'orbit' | 'walkthrough' | 'topdown'>(cameraMode);
  const isWireframeRef = useRef<boolean>(isWireframe);
  const showDoorDistancesRef = useRef<boolean>(showDoorDistances);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    isWireframeRef.current = isWireframe;
  }, [isWireframe]);

  useEffect(() => {
    showDoorDistancesRef.current = showDoorDistances;
  }, [showDoorDistances]);

  // 10-Second Red Dot Alert State: Starts GREEN for first 10 seconds, then turns RED
  const [isRedAlert, setIsRedAlert] = useState<boolean>(false);
  const [alertCountdown, setAlertCountdown] = useState<number>(10);
  const isRedAlertRef = useRef<boolean>(false);
  const alertMeshMaterialsRef = useRef<{ mat: any; hasEmissive?: boolean }[]>([]);

  useEffect(() => {
    let seconds = 0;
    setIsRedAlert(false);
    isRedAlertRef.current = false;
    setAlertCountdown(10);

    // Initial state: green (0x10b981)
    alertMeshMaterialsRef.current.forEach(({ mat, hasEmissive }) => {
      if (mat && mat.color) mat.color.set(0x10b981);
      if (hasEmissive && mat && mat.emissive) mat.emissive.set(0x10b981);
      if (mat) mat.needsUpdate = true;
    });

    const timer = setInterval(() => {
      seconds += 1;
      const remaining = Math.max(0, 10 - seconds);
      setAlertCountdown(remaining);

      if (seconds >= 10) {
        setIsRedAlert(true);
        isRedAlertRef.current = true;
        // Turn RED (0xef4444)
        alertMeshMaterialsRef.current.forEach(({ mat, hasEmissive }) => {
          if (mat && mat.color) mat.color.set(0xef4444);
          if (hasEmissive && mat && mat.emissive) mat.emissive.set(0xef4444);
          if (mat) mat.needsUpdate = true;
        });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [architecture]);

  const handleResetAlertTimer = () => {
    setIsRedAlert(false);
    isRedAlertRef.current = false;
    setAlertCountdown(10);

    alertMeshMaterialsRef.current.forEach(({ mat, hasEmissive }) => {
      if (mat && mat.color) mat.color.set(0x10b981);
      if (hasEmissive && mat && mat.emissive) mat.emissive.set(0x10b981);
      if (mat) mat.needsUpdate = true;
    });

    let seconds = 0;
    const timer = setInterval(() => {
      seconds += 1;
      const remaining = Math.max(0, 10 - seconds);
      setAlertCountdown(remaining);

      if (seconds >= 10) {
        setIsRedAlert(true);
        isRedAlertRef.current = true;
        alertMeshMaterialsRef.current.forEach(({ mat, hasEmissive }) => {
          if (mat && mat.color) mat.color.set(0xef4444);
          if (hasEmissive && mat && mat.emissive) mat.emissive.set(0xef4444);
          if (mat) mat.needsUpdate = true;
        });
        clearInterval(timer);
      }
    }, 1000);
  };

  // References for Three.js instance in Web
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);
  const orbitGroupRef = useRef<THREE.Group | null>(null);
  const wallsMeshGroupRef = useRef<THREE.Group | null>(null);
  const beaconsGroupRef = useRef<THREE.Group | null>(null);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);
  const squadGroupRef = useRef<THREE.Group | null>(null);
  const squadPulseRingsRef = useRef<THREE.Mesh[]>([]);

  // Camera spherical coordinates
  const cameraAngle = useRef<number>(Math.PI * 0.25); // 45 deg
  const cameraElevation = useRef<number>(Math.PI * 0.28); // ~50 deg
  const cameraDistance = useRef<number>(32);
  const isDragging = useRef<boolean>(false);
  const previousPointerPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Walkthrough animation progress
  const walkthroughPathIndex = useRef<number>(0);

  // Post message to native WebView
  const postToNativeWebView = (msg: any) => {
    if (Platform.OS !== 'web' && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(msg));
    }
  };

  // Sync zoom level from parent props
  useEffect(() => {
    if (zoomLevel) {
      cameraDistance.current = Math.max(16, Math.min(48, 32 / zoomLevel));
      postToNativeWebView({ type: 'SET_ZOOM_LEVEL', value: zoomLevel });
    }
  }, [zoomLevel]);

  // Sync walkthrough toggle from parent props
  useEffect(() => {
    if (walkthroughActive) {
      setCameraMode('walkthrough');
      setAutoRotate(false);
      postToNativeWebView({ type: 'SET_CAMERA_MODE', value: 'walkthrough' });
    } else if (cameraMode === 'walkthrough') {
      setCameraMode('orbit');
      setAutoRotate(true);
      postToNativeWebView({ type: 'SET_CAMERA_MODE', value: 'orbit' });
    }
  }, [walkthroughActive]);

  // Sync architecture updates to native WebView
  useEffect(() => {
    if (architecture) {
      postToNativeWebView({ type: 'UPDATE_ARCHITECTURE', architecture });
    }
  }, [architecture]);

  // Handle messages from native WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HUD_UPDATE') {
        if (typeof data.azimuth === 'number') setAzimuthAngle(data.azimuth);
        if (typeof data.pitch === 'number') setPitchAngle(data.pitch);
      }
    } catch (e) {}
  };

  // Rebuild 3D walls, rooms floor zones, and markers whenever architecture changes
  const buildArchitectureScene = (arch: Architecture3D) => {
    if (!wallsMeshGroupRef.current || !beaconsGroupRef.current) return;
    const wallsGroup = wallsMeshGroupRef.current;
    const beaconsGroup = beaconsGroupRef.current;

    // Clear existing wall and floor meshes
    while (wallsGroup.children.length > 0) {
      const child = wallsGroup.children[0];
      wallsGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }

    // Clear existing beacons
    while (beaconsGroup.children.length > 0) {
      const child = beaconsGroup.children[0];
      beaconsGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }
    pulseRingsRef.current = [];
    alertMeshMaterialsRef.current = [];

    // A. Create Colored Floor Tiles For Each Room Zone
    arch.rooms.forEach((room) => {
      const rw = room.bounds.width;
      const rd = room.bounds.depth;
      const rx = room.bounds.x + rw / 2;
      const rz = room.bounds.z + rd / 2;

      const roomFloorGeo = new THREE.PlaneGeometry(rw - 0.2, rd - 0.2);
      const roomFloorMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(room.color || '#10B981'),
        roughness: 0.6,
        metalness: 0.2,
        transparent: true,
        opacity: 0.18,
      });
      const roomFloorMesh = new THREE.Mesh(roomFloorGeo, roomFloorMat);
      roomFloorMesh.rotation.x = -Math.PI / 2;
      roomFloorMesh.position.set(rx, 0.02, rz);
      roomFloorMesh.receiveShadow = true;
      wallsGroup.add(roomFloorMesh);

      const borderEdges = new THREE.EdgesGeometry(roomFloorGeo);
      const borderMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(room.color || '#10B981'),
        transparent: true,
        opacity: 0.6,
      });
      const borderLine = new THREE.LineSegments(borderEdges, borderMat);
      borderLine.rotation.x = -Math.PI / 2;
      borderLine.position.set(rx, 0.03, rz);
      wallsGroup.add(borderLine);
    });

    // B. Create Solid Extruded 3D Architectural Walls with Glowing Edges
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x142b1d,
      roughness: 0.35,
      metalness: 0.65,
      wireframe: isWireframeRef.current,
    });
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x34d399,
      linewidth: 1.5,
    });

    arch.walls.forEach((w) => {
      const wallGeo = new THREE.BoxGeometry(w.width, w.height, w.depth);
      const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
      wallMesh.position.set(w.x, w.y, w.z);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallsGroup.add(wallMesh);

      const edges = new THREE.EdgesGeometry(wallGeo);
      const edgeLine = new THREE.LineSegments(edges, edgeMaterial);
      edgeLine.position.set(w.x, w.y, w.z);
      wallsGroup.add(edgeLine);
    });

    // C. Tactical Furniture & Spatial Props placed inside each room
    if (arch.rooms && arch.rooms.length > 0) {
      arch.rooms.forEach((room) => {
        const cx = room.bounds.x + room.bounds.width / 2;
        const cz = room.bounds.z + room.bounds.depth / 2;

        if (room.type === 'CONFERENCE' || room.name.includes('Meeting')) {
          // Conference Room: Large Conference Table with glowing briefing rim
          const tw = Math.min(5.2, room.bounds.width * 0.55);
          const td = Math.min(2.4, room.bounds.depth * 0.45);
          const tableGeo = new THREE.BoxGeometry(tw, 0.75, td);
          const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
          const tableMesh = new THREE.Mesh(tableGeo, tableMat);
          tableMesh.position.set(cx, 0.38, cz);
          tableMesh.castShadow = true;
          wallsGroup.add(tableMesh);

          const rimGeo = new THREE.BoxGeometry(tw + 0.1, 0.05, td + 0.1);
          const rimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const rimMesh = new THREE.Mesh(rimGeo, rimMat);
          rimMesh.position.set(cx, 0.76, cz);
          wallsGroup.add(rimMesh);
        } else if (room.type === 'SERVER' || room.name.includes('Server') || room.name.includes('Vault')) {
          // Cyber Server Vault: Server Racks with Cyan LEDs
          for (let i = 0; i < 3; i++) {
            const rackGeo = new THREE.BoxGeometry(0.55, 2.1, 0.85);
            const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
            const rack = new THREE.Mesh(rackGeo, rackMat);
            rack.position.set(cx - 0.7 + i * 0.7, 1.05, cz);
            wallsGroup.add(rack);

            const ledGeo = new THREE.BoxGeometry(0.56, 0.06, 0.1);
            const ledMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(cx - 0.7 + i * 0.7, 1.6, cz + 0.38);
            wallsGroup.add(led);
          }
        } else if (room.type === 'WORKSTATION' || room.name.includes('Staff')) {
          // Workstations: Central Command Desks
          const dw = Math.min(4.8, room.bounds.width * 0.5);
          const dd = Math.min(2.2, room.bounds.depth * 0.4);
          const deskGeo = new THREE.BoxGeometry(dw, 0.72, dd);
          const deskMat = new THREE.MeshStandardMaterial({ color: 0x13271c, roughness: 0.5 });
          const desk = new THREE.Mesh(deskGeo, deskMat);
          desk.position.set(cx, 0.36, cz);
          wallsGroup.add(desk);
        } else if (room.type === 'RECEPTION' || room.name.includes('Reception')) {
          // Reception: Curved Security Counter
          const counterGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.9, 16, 1, false, 0, Math.PI);
          const counterMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.4 });
          const counter = new THREE.Mesh(counterGeo, counterMat);
          counter.rotation.y = Math.PI / 2;
          counter.position.set(cx, 0.45, cz);
          wallsGroup.add(counter);
        } else if (room.type === 'COMMAND' || room.type === 'OFFICE' || room.name.includes('Cabin')) {
          // Officer Cabins: Executive Work Desks
          const deskGeo = new THREE.BoxGeometry(1.4, 0.72, 0.8);
          const deskMat = new THREE.MeshStandardMaterial({ color: 0x164e63, roughness: 0.4 });
          const desk = new THREE.Mesh(deskGeo, deskMat);
          desk.position.set(cx, 0.36, cz);
          wallsGroup.add(desk);
        }
      });
    }

    // D. 3D Animated Floating Tactical Beacons (With 10s Alert Timer)
    arch.tacticalMarkers.forEach((marker: any) => {
      const beaconSubGroup = new THREE.Group();
      beaconSubGroup.position.set(marker.position.x, marker.position.y, marker.position.z);
      beaconsGroup.add(beaconSubGroup);

      const isAlertMarker = marker.color === '#EF4444' || marker.id === 'marker-server-vault' || marker.type === 'OBJECTIVE';
      const initialColorHex = isAlertMarker
        ? (isRedAlertRef.current ? 0xef4444 : 0x10b981)
        : (marker.color ? parseInt(marker.color.replace('#', '0x'), 16) : 0x10b981);

      const color = new THREE.Color(initialColorHex);
      const diamondGeo = new THREE.OctahedronGeometry(0.48, 0);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
      diamondMesh.position.y = 0;
      beaconSubGroup.add(diamondMesh);

      const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.7 });
      const linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -marker.position.y + 0.05, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const verticalLine = new THREE.Line(lineGeo, lineMat);
      beaconSubGroup.add(verticalLine);

      const ringGeo = new THREE.RingGeometry(0.4, 0.7, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      pulseRing.rotation.x = Math.PI / 2;
      pulseRing.position.set(marker.position.x, 0.05, marker.position.z);
      beaconsGroup.add(pulseRing);
      pulseRingsRef.current.push(pulseRing);

      if (isAlertMarker) {
        alertMeshMaterialsRef.current.push({ mat: diamondMat, hasEmissive: true });
        alertMeshMaterialsRef.current.push({ mat: lineMat });
        alertMeshMaterialsRef.current.push({ mat: ringMat });
      }
    });

    // E. 3D Doorways & Door-to-Door Distance Rangefinder Measurements
    if (arch.doors && arch.doors.length > 0) {
      arch.doors.forEach((door: any) => {
        const frameMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.35,
          roughness: 0.3,
        });

        // Left post
        const postGeo = new THREE.BoxGeometry(0.12, 2.2, 0.12);
        const leftPost = new THREE.Mesh(postGeo, frameMat);
        leftPost.position.set(door.position.x - 0.5, 1.1, door.position.z);
        wallsGroup.add(leftPost);

        // Right post
        const rightPost = new THREE.Mesh(postGeo, frameMat);
        rightPost.position.set(door.position.x + 0.5, 1.1, door.position.z);
        wallsGroup.add(rightPost);

        // Lintel top bar
        const lintelGeo = new THREE.BoxGeometry(1.12, 0.14, 0.14);
        const lintel = new THREE.Mesh(lintelGeo, frameMat);
        lintel.position.set(door.position.x, 2.2, door.position.z);
        wallsGroup.add(lintel);
      });
    }

    if (showDoorDistancesRef.current && arch.doorDistances && arch.doorDistances.length > 0) {
      arch.doorDistances.forEach((meas: any) => {
        const isAlertDoor = meas.color === '#EF4444' || meas.id === 'dist-md-server';
        const initialMeasColor = isAlertDoor
          ? (isRedAlertRef.current ? 0xef4444 : 0x10b981)
          : (meas.color ? parseInt(meas.color.replace('#', '0x'), 16) : 0x38bdf8);

        const p1 = new THREE.Vector3(meas.fromPos.x, meas.fromPos.y, meas.fromPos.z);
        const p2 = new THREE.Vector3(meas.toPos.x, meas.toPos.y, meas.toPos.z);

        const lineMat = new THREE.LineDashedMaterial({
          color: new THREE.Color(initialMeasColor),
          dashSize: 0.35,
          gapSize: 0.2,
        });

        const linePoints = [p1, p2];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        wallsGroup.add(line);

        // Node spheres at endpoints
        const nodeGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const nodeMat = new THREE.MeshBasicMaterial({ color: initialMeasColor });
        const n1 = new THREE.Mesh(nodeGeo, nodeMat);
        n1.position.copy(p1);
        wallsGroup.add(n1);
        const n2 = new THREE.Mesh(nodeGeo, nodeMat);
        n2.position.copy(p2);
        wallsGroup.add(n2);

        if (isAlertDoor) {
          alertMeshMaterialsRef.current.push({ mat: lineMat });
          alertMeshMaterialsRef.current.push({ mat: nodeMat });
        }

        // 3D Distance Label Sprite
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 72;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'rgba(6, 20, 14, 0.94)';
            ctx.strokeStyle = meas.color || '#38bdf8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            if ((ctx as any).roundRect) {
              (ctx as any).roundRect(8, 8, 240, 56, 16);
            } else {
              ctx.rect(8, 8, 240, 56);
            }
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 26px Arial, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`↔ ${meas.distanceMeters}m`, 128, 36);

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(1.8, 0.55, 1);
            sprite.position.set((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 + 0.35, (p1.z + p2.z) / 2);
            wallsGroup.add(sprite);
          }
        } catch (_) {}
      });
    }
  };

  // Render Squad Commando Figures & Live Inter-Unit Rangefinder Vector
  const renderSquadEntities = (squad: SquadLocationData | null | undefined) => {
    if (!squadGroupRef.current) return;
    const group = squadGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }
    squadPulseRingsRef.current = [];

    if (!squad || !squad.primaryUser || !squad.dummyUser) return;

    const pUser = squad.primaryUser;
    const dUser = squad.dummyUser;

    const createOperatorMesh = (operator: typeof pUser, isPrimary: boolean) => {
      const opGroup = new THREE.Group();
      const x = operator.location.x;
      const z = operator.location.z;
      const themeColor = isPrimary ? 0x10b981 : 0x38bdf8;
      const darkColor = isPrimary ? 0x064e3b : 0x0c4a6e;

      opGroup.position.set(x, 0, z);

      // 1. Expanding ground radar pulse ring
      const ringGeo = new THREE.RingGeometry(0.5, 0.85, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: themeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      pulseRing.rotation.x = Math.PI / 2;
      pulseRing.position.y = 0.06;
      opGroup.add(pulseRing);
      squadPulseRingsRef.current.push(pulseRing);

      // 2. Base pedestal glow cylinder
      const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.1, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x07150e,
        metalness: 0.8,
        roughness: 0.2,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.05;
      opGroup.add(baseMesh);

      // 3. Commando Body / Tactical Torso
      const torsoGeo = new THREE.CylinderGeometry(0.28, 0.38, 1.15, 8);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: darkColor,
        roughness: 0.4,
        metalness: 0.6,
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
      torsoMesh.position.y = 0.65;
      torsoMesh.castShadow = true;
      opGroup.add(torsoMesh);

      // 4. Tactical Body Armor Vest
      const vestGeo = new THREE.BoxGeometry(0.48, 0.62, 0.35);
      const vestMat = new THREE.MeshStandardMaterial({
        color: isPrimary ? 0x022c22 : 0x082f49,
        roughness: 0.3,
      });
      const vestMesh = new THREE.Mesh(vestGeo, vestMat);
      vestMesh.position.y = 0.78;
      opGroup.add(vestMesh);

      // 5. Tactical Helmet & Head
      const headGeo = new THREE.SphereGeometry(0.22, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        roughness: 0.3,
        metalness: 0.5,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.y = 1.35;
      opGroup.add(headMesh);

      // 6. Glowing Night-Vision Visor
      const visorGeo = new THREE.BoxGeometry(0.26, 0.09, 0.18);
      const visorMat = new THREE.MeshBasicMaterial({
        color: isPrimary ? 0x6ee7b7 : 0x7dd3fc,
      });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 1.37, 0.13);
      opGroup.add(visorMesh);

      // 7. Tactical Weapon Barrel
      const barrelGeo = new THREE.BoxGeometry(0.06, 0.06, 0.6);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
      barrelMesh.position.set(0.18, 0.85, 0.35);
      opGroup.add(barrelMesh);

      // 8. 3D Floating Name & Location Tag Sprite
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(5, 18, 12, 0.94)';
          ctx.strokeStyle = isPrimary ? '#10B981' : '#38BDF8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          if ((ctx as any).roundRect) {
            (ctx as any).roundRect(8, 8, 284, 74, 16);
          } else {
            ctx.rect(8, 8, 284, 74);
          }
          ctx.fill();
          ctx.stroke();

          // Title
          ctx.font = 'bold 24px Arial, sans-serif';
          ctx.fillStyle = isPrimary ? '#34D399' : '#38BDF8';
          ctx.textAlign = 'center';
          ctx.fillText(
            isPrimary ? '🟢 YOU (CAPT. ARJUN)' : '🔵 DUMMY (COMM. VIKRAM)',
            150,
            34
          );

          // Room Subtitle
          ctx.font = 'bold 18px Arial, sans-serif';
          ctx.fillStyle = '#E2E8F0';
          const roomShort = (operator.location.roomName || 'SECTOR').slice(0, 24);
          ctx.fillText(`📍 ${roomShort}`, 150, 64);

          const texture = new THREE.CanvasTexture(canvas);
          texture.minFilter = THREE.LinearFilter;
          const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
          });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(2.4, 0.72, 1);
          sprite.position.set(0, 2.3, 0);
          opGroup.add(sprite);
        }
      } catch (_) {}

      group.add(opGroup);
    };

    createOperatorMesh(pUser, true);
    createOperatorMesh(dUser, false);

    // 9. Standoff Laser Vector Line Connecting Both Users
    const p1 = new THREE.Vector3(pUser.location.x, 0.85, pUser.location.z);
    const p2 = new THREE.Vector3(dUser.location.x, 0.85, dUser.location.z);

    const laserMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      dashSize: 0.35,
      gapSize: 0.2,
      linewidth: 3,
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const laserLine = new THREE.Line(laserGeo, laserMat);
    laserLine.computeLineDistances();
    group.add(laserLine);

    // Glowing Node Spheres at line ends
    const endGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const endMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const end1 = new THREE.Mesh(endGeo, endMat);
    end1.position.copy(p1);
    group.add(end1);
    const end2 = new THREE.Mesh(endGeo, endMat);
    end2.position.copy(p2);
    group.add(end2);

    // 10. Midpoint 3D Distance Banner Sprite
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(20, 14, 4, 0.95)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        if ((ctx as any).roundRect) {
          (ctx as any).roundRect(8, 8, 304, 64, 16);
        } else {
          ctx.rect(8, 8, 304, 64);
        }
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillStyle = '#FBBF24';
        ctx.textAlign = 'center';
        ctx.fillText(
          `⚡ RANGE: ${squad.interUnitMetrics?.distanceMeters || 11.2} METERS`,
          160,
          36
        );

        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(
          `BEARING: ${squad.interUnitMetrics?.bearingCompass || 'SW'} ${squad.interUnitMetrics?.bearingDegrees || 245}° • ${squad.interUnitMetrics?.lineOfSight || 'LOS_OPEN'}`,
          160,
          60
        );

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const spriteMat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(2.8, 0.7, 1);
        sprite.position.set((p1.x + p2.x) / 2, 1.45, (p1.z + p2.z) / 2);
        group.add(sprite);
      }
    } catch (_) {}
  };

  // Re-render meshes whenever activeArch or showDoorDistances changes
  useEffect(() => {
    if (Platform.OS === 'web' && wallsMeshGroupRef.current) {
      buildArchitectureScene(activeArch);
    }
  }, [activeArch, showDoorDistances]);

  // Re-render squad entities whenever squadData changes
  useEffect(() => {
    if (Platform.OS === 'web' && squadGroupRef.current) {
      renderSquadEntities(squadData);
    }
  }, [squadData]);

  // Web Platform Three.js Setup (Runs ONCE on mount)
  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth || 460;
    const height = container.clientHeight || 390;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050e08);
    scene.fog = new THREE.FogExp2(0x050e08, 0.018);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0d2818, 2.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(20, 40, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const greenFillLight = new THREE.DirectionalLight(0x10b981, 1.4);
    greenFillLight.position.set(-20, 20, -15);
    scene.add(greenFillLight);

    const centerPointLight = new THREE.PointLight(0x34d399, 2.0, 30);
    centerPointLight.position.set(0, 6, 0);
    scene.add(centerPointLight);

    // 5. Tactical Ground Grid & Foundation Slab
    const gridHelper = new THREE.GridHelper(60, 40, 0x10b981, 0x143522);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x091710,
      roughness: 0.8,
      metalness: 0.3,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Main Group containing all architectural items
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    orbitGroupRef.current = orbitGroup;

    const wallsGroup = new THREE.Group();
    orbitGroup.add(wallsGroup);
    wallsMeshGroupRef.current = wallsGroup;

    const beaconsGroup = new THREE.Group();
    orbitGroup.add(beaconsGroup);
    beaconsGroupRef.current = beaconsGroup;
    pulseRingsRef.current = [];

    const squadGroup = new THREE.Group();
    orbitGroup.add(squadGroup);
    squadGroupRef.current = squadGroup;
    squadPulseRingsRef.current = [];

    // Build initial architecture & squad telemetry
    buildArchitectureScene(activeArch);
    renderSquadEntities(squadData);

    // 7. Mouse & Touch Drag Controls for 360° Orbit Rotation
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerPosition.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousPointerPosition.current.x;
      const deltaY = clientY - previousPointerPosition.current.y;

      previousPointerPosition.current = { x: clientX, y: clientY };

      cameraAngle.current -= deltaX * 0.008;
      cameraElevation.current = Math.max(
        0.1,
        Math.min(Math.PI * 0.46, cameraElevation.current + deltaY * 0.008)
      );

      const deg = Math.round(((-cameraAngle.current * 180) / Math.PI) % 360);
      setAzimuthAngle(deg < 0 ? deg + 360 : deg);
      setPitchAngle(Math.round((cameraElevation.current * 180) / Math.PI));
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance.current = Math.max(14, Math.min(52, cameraDistance.current + e.deltaY * 0.025));
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // 8. Main Render & Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (autoRotateRef.current && !isDragging.current && cameraModeRef.current === 'orbit') {
        cameraAngle.current += 0.006;
        const deg = Math.round(((-cameraAngle.current * 180) / Math.PI) % 360);
        setAzimuthAngle(deg < 0 ? deg + 360 : deg);
      }

      if (cameraModeRef.current === 'orbit') {
        const dist = cameraDistance.current;
        const elev = cameraElevation.current;
        const ang = cameraAngle.current;

        camera.position.x = dist * Math.sin(ang) * Math.cos(elev);
        camera.position.y = dist * Math.sin(elev);
        camera.position.z = dist * Math.cos(ang) * Math.cos(elev);
        camera.lookAt(0, 1.2, 0);
      } else if (cameraModeRef.current === 'topdown') {
        camera.position.set(0, cameraDistance.current * 1.1, 0.001);
        camera.lookAt(0, 0, 0);
      } else if (cameraModeRef.current === 'walkthrough') {
        walkthroughPathIndex.current += 0.008;
        const t = walkthroughPathIndex.current;
        const radius = 9.0;
        const camX = Math.sin(t * 0.4) * radius;
        const camZ = Math.cos(t * 0.4) * (radius * 0.8);
        const lookTargetX = Math.sin(t * 0.4 + 0.3) * radius;
        const lookTargetZ = Math.cos(t * 0.4 + 0.3) * (radius * 0.8);

        camera.position.set(camX, 1.6, camZ);
        camera.lookAt(lookTargetX, 1.6, lookTargetZ);
      }

      if (beaconsGroupRef.current) {
        beaconsGroupRef.current.children.forEach((child, idx) => {
          if (child instanceof THREE.Group && child.children[0]) {
            child.children[0].position.y = Math.sin(elapsedTime * 3 + idx) * 0.18;
            child.children[0].rotation.y += 0.02;
          }
        });
      }

      pulseRingsRef.current.forEach((ring, idx) => {
        const scale = 1 + (Math.sin(elapsedTime * 2.5 + idx) + 1) * 0.4;
        ring.scale.set(scale, scale, 1);
      });

      squadPulseRingsRef.current.forEach((ring, idx) => {
        const scale = 1 + (Math.sin(elapsedTime * 3.2 + idx) + 1) * 0.35;
        ring.scale.set(scale, scale, 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Handle Wireframe Toggle
  const toggleWireframe = () => {
    setIsWireframe((prev) => {
      const next = !prev;
      if (wallsMeshGroupRef.current) {
        wallsMeshGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => (m.wireframe = next));
            } else {
              child.material.wireframe = next;
            }
          }
        });
      }
      postToNativeWebView({ type: 'TOGGLE_WIREFRAME' });
      return next;
    });
  };

  const handleToggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    postToNativeWebView({ type: 'SET_AUTO_ROTATE', value: next });
  };

  const handleCycleCameraMode = () => {
    let nextMode: 'orbit' | 'walkthrough' | 'topdown';
    if (cameraMode === 'orbit') {
      nextMode = 'walkthrough';
      setAutoRotate(false);
    } else if (cameraMode === 'walkthrough') {
      nextMode = 'topdown';
      setAutoRotate(false);
    } else {
      nextMode = 'orbit';
      setAutoRotate(true);
    }
    setCameraMode(nextMode);
    postToNativeWebView({ type: 'SET_CAMERA_MODE', value: nextMode });
  };

  const handleZoomIn = () => {
    cameraDistance.current = Math.max(14, cameraDistance.current - 4);
    postToNativeWebView({ type: 'ZOOM_IN' });
  };

  const handleZoomOut = () => {
    cameraDistance.current = Math.min(52, cameraDistance.current + 4);
    postToNativeWebView({ type: 'ZOOM_OUT' });
  };

  const resetCamera = () => {
    cameraAngle.current = Math.PI * 0.25;
    cameraElevation.current = Math.PI * 0.28;
    cameraDistance.current = 32;
    setCameraMode('orbit');
    setAutoRotate(true);
    setAzimuthAngle(45);
    setPitchAngle(38);
    postToNativeWebView({ type: 'RESET_CAMERA' });
  };

  // Generate HTML for native WebView
  const nativeHtml = useMemo(() => {
    return generateNativeThreeHtml(activeArch, autoRotate, cameraMode, isWireframe);
  }, [activeArch]);

  return (
    <View style={styles.container}>
      {/* 3D Canvas Viewport: Native HTML5 WebGL via WebView OR Direct Web DOM Canvas */}
      {Platform.OS === 'web' ? (
        <div
          ref={containerRef as any}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            cursor: isDragging.current ? 'grabbing' : 'grab',
          }}
        >
          <canvas
            ref={canvasRef as any}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              touchAction: 'none',
            }}
          />
        </div>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: nativeHtml }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          androidLayerType="hardware"
          scalesPageToFit={true}
          scrollEnabled={false}
          bounces={false}
          onMessage={handleWebViewMessage}
        />
      )}

      {/* Top Left HUD: Tactical Compass, Status & 10s Alert Countdown */}
      <View style={styles.topHudLeft} pointerEvents="box-none">
        <View style={styles.statusBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.statusBadgeText}>
            {cameraMode === 'walkthrough'
              ? '3D WALKTHROUGH'
              : autoRotate
              ? '3D ROTATING 360°'
              : '3D ORBIT ACTIVE'}
          </Text>
        </View>
        <Text style={styles.hudDegrees}>
          {`AZIMUTH: ${azimuthAngle}° | PITCH: ${pitchAngle}° | CLEARANCE: ${activeArch.dimensions?.clearanceMeters || 3.2}m`}
        </Text>

        {/* 10-Second Red Dot Alert Badge */}
        <View style={[styles.threatAlertBadge, isRedAlert ? styles.threatAlertBadgeRed : styles.threatAlertBadgeGreen]}>
          <View style={[styles.threatPulseDot, { backgroundColor: isRedAlert ? '#EF4444' : '#10B981' }]} />
          <Text style={[styles.threatAlertText, { color: isRedAlert ? '#FCA5A5' : '#6EE7B7' }]}>
            {isRedAlert ? '🔴 TARGET SECTOR: RED ALERT' : `🟢 TARGET: GREEN (${alertCountdown}s)`}
          </Text>
        </View>
      </View>

      {/* Top Right HUD: 3D Control Action Buttons */}
      <View style={styles.topHudRight} pointerEvents="box-none">
        {/* Re-test 10s Timer Button */}
        <TouchableOpacity
          style={[styles.hudButton, isRedAlert && { borderColor: '#EF4444' }]}
          onPress={handleResetAlertTimer}
          activeOpacity={0.8}
        >
          <Text style={styles.hudButtonText}>{isRedAlert ? '🔄 Reset 10s' : `⏱️ ${alertCountdown}s`}</Text>
        </TouchableOpacity>

        {/* Auto-Rotate Play/Pause Toggle */}
        <TouchableOpacity
          style={[styles.hudButton, autoRotate && styles.hudButtonActive]}
          onPress={handleToggleAutoRotate}
          activeOpacity={0.8}
        >
          <Text style={styles.hudButtonText}>{autoRotate ? '⏸️ Auto' : '▶️ Spin'}</Text>
        </TouchableOpacity>

        {/* View Mode: Orbit / Walkthrough / TopDown */}
        <TouchableOpacity
          style={[styles.hudButton, cameraMode === 'walkthrough' && styles.hudButtonActive]}
          onPress={handleCycleCameraMode}
          activeOpacity={0.8}
        >
          <Text style={styles.hudButtonText}>
            {cameraMode === 'orbit' ? '🚁 3D Orbit' : cameraMode === 'walkthrough' ? '🚶 Walk' : '📐 Top'}
          </Text>
        </TouchableOpacity>

        {/* Wireframe Toggle */}
        <TouchableOpacity
          style={[styles.hudButton, isWireframe && styles.hudButtonActive]}
          onPress={toggleWireframe}
          activeOpacity={0.8}
        >
          <Text style={styles.hudButtonText}>{isWireframe ? '▦ Wire' : '⬛ Solid'}</Text>
        </TouchableOpacity>

        {/* Door Distance Laser Rangefinder Toggle */}
        <TouchableOpacity
          style={[styles.hudButton, showDoorDistances && styles.hudButtonActive]}
          onPress={() => setShowDoorDistances(!showDoorDistances)}
          activeOpacity={0.8}
        >
          <Text style={styles.hudButtonText}>{showDoorDistances ? '📏 Doors ON' : '📏 Doors'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Rangefinder Bar: Door to Door Distances */}
      {showDoorDistances && activeArch.doorDistances && activeArch.doorDistances.length > 0 && (
        <View style={styles.rangefinderContainer} pointerEvents="box-none">
          <View style={styles.rangefinderHeader}>
            <View style={styles.rangefinderTitleRow}>
              <View style={styles.rangefinderPulseDot} />
              <Text style={styles.rangefinderTitle}>DOOR-TO-DOOR LASER RANGEFINDER</Text>
            </View>
            <Text style={styles.rangefinderSubtitle}>
              {`${activeArch.doorDistances.length} Active Distance Vectors`}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rangefinderScrollContent}
            style={styles.rangefinderScroll}
          >
            {activeArch.doorDistances.map((meas, idx) => {
              const isAlertDoor = meas.color === '#EF4444' || meas.id === 'dist-md-server';
              const pillColor = isAlertDoor
                ? (isRedAlert ? '#EF4444' : '#10B981')
                : (meas.color || '#38BDF8');

              return (
                <View key={meas.id || idx} style={styles.rangefinderPill}>
                  <View style={[styles.rangefinderDot, { backgroundColor: pillColor }]} />
                  <View style={styles.rangefinderInfo}>
                    <Text style={styles.rangefinderNames} numberOfLines={1}>
                      {`${meas.fromName} ➔ ${meas.toName}`}
                    </Text>
                    <Text style={[styles.rangefinderDist, { color: pillColor }]}>
                      {`↔ ${meas.distanceMeters}m`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Bottom Right Floating Zoom & Reset Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity style={styles.controlCircle} onPress={handleZoomIn}>
          <Text style={styles.controlIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlCircle} onPress={handleZoomOut}>
          <Text style={styles.controlIcon}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlCircle} onPress={resetCamera}>
          <Text style={styles.controlIcon}>🎯</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 390,
    backgroundColor: '#050E08',
    position: 'relative',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#050E08',
  },
  topHudLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 23, 16, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D452A',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudDegrees: {
    color: '#7D9987',
    fontSize: 9.5,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    fontWeight: '600',
    backgroundColor: 'rgba(5, 14, 8, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  threatAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  threatAlertBadgeGreen: {
    backgroundColor: 'rgba(6, 30, 18, 0.88)',
    borderColor: '#10B981',
  },
  threatAlertBadgeRed: {
    backgroundColor: 'rgba(40, 10, 10, 0.92)',
    borderColor: '#EF4444',
  },
  threatPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  threatAlertText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  topHudRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
    gap: 6,
  },
  hudButton: {
    backgroundColor: 'rgba(14, 34, 21, 0.85)',
    borderWidth: 1,
    borderColor: '#1D452A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hudButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#163822',
  },
  hudButtonText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  floatingControls: {
    position: 'absolute',
    right: 12,
    bottom: 42,
    backgroundColor: 'rgba(11, 25, 16, 0.88)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1D452A',
    zIndex: 10,
  },
  controlCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#163822',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  controlIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rangefinderContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 56,
    backgroundColor: 'rgba(6, 18, 12, 0.94)',
    borderWidth: 1,
    borderColor: '#1D452A',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    zIndex: 12,
  },
  rangefinderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rangefinderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangefinderPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
    marginRight: 6,
  },
  rangefinderTitle: {
    color: '#38BDF8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  rangefinderSubtitle: {
    color: '#6B8775',
    fontSize: 8.5,
    fontWeight: '600',
  },
  rangefinderScroll: {
    maxHeight: 34,
  },
  rangefinderScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangefinderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 31, 20, 0.88)',
    borderWidth: 1,
    borderColor: '#245634',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rangefinderDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },
  rangefinderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangefinderNames: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '600',
  },
  rangefinderDist: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
});

export default Tactical3DCanvas;
