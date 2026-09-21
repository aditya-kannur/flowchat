"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";
import * as THREE from "three";

function latLonToVector3(lat, lon, radius = 2.05) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Trajectory({ data, anomalies, onSelect }) {

  const points = useMemo(() => {
    return data
      .filter(
        (p) =>
          Number.isFinite(Number(p.LATITUDE)) &&
          Number.isFinite(Number(p.LONGITUDE))
      )
      .map((p, index) => ({
        ...p,
        index,
        position: latLonToVector3(
          Number(p.LATITUDE),
          Number(p.LONGITUDE)
        ),
      }));
  }, [data]);

  const anomalyPoints = useMemo(() => {
    return anomalies
      .filter(
        (p) =>
          Number.isFinite(Number(p.LATITUDE)) &&
          Number.isFinite(Number(p.LONGITUDE))
      )
      .map((p, index) => ({
        ...p,
        index,
        position: latLonToVector3(
          Number(p.LATITUDE),
          Number(p.LONGITUDE),
          2.1
        ),
      }));
  }, [anomalies]);

  const geometry = useMemo(() => {
    const positions = points.map((p) => p.position);

    if (positions.length < 2) {
      return new THREE.BufferGeometry();
    }

    return new THREE.BufferGeometry().setFromPoints(positions);
  }, [points]);

  return (
    <group>

      {points.length > 1 && (
        <line geometry={geometry}>
          <lineBasicMaterial />
        </line>
      )}

      {points.map((point) => (
        <mesh
          key={`point-${point.index}`}
          position={point.position}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(point);
          }}
        >
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
      ))}

      {anomalyPoints.map((point) => (
        <mesh
          key={`anomaly-${point.index}`}
          position={point.position}
          onClick={(event) => {
            event.stopPropagation();
            onSelect({
              ...point,
              isAnomaly: true,
            });
          }}
        >
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshBasicMaterial />
        </mesh>
      ))}

    </group>
  );
}

export default function OceanGlobe({
  data = [],
  anomalies = [],
}) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="globe-wrapper">

      <div className="globe-container">

        <Canvas
          camera={{
            position: [0, 0, 6],
            fov: 45,
          }}
        >

          <ambientLight intensity={1} />

          <mesh>
            <sphereGeometry args={[2, 48, 48]} />

            <meshBasicMaterial
              wireframe
              transparent
              opacity={0.25}
            />
          </mesh>

          <Trajectory
            data={data}
            anomalies={anomalies}
            onSelect={setSelected}
          />

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.6}
            zoomSpeed={0.8}
          />

        </Canvas>

      </div>

      <div className="globe-info">

        {!selected ? (
          <div>
            <strong>Explore the trajectory</strong>
            <p>
              Drag to rotate. Scroll to zoom. Click an observation
              point to inspect its recorded position.
            </p>
          </div>
        ) : (
          <div>

            <div className="selected-title">
              <strong>
                {selected.isAnomaly
                  ? "Temperature anomaly"
                  : "ARGO observation"}
              </strong>

              <button
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            <div className="selected-grid">

              <div>
                <span>Latitude</span>
                <strong>
                  {Number(selected.LATITUDE).toFixed(3)}°
                </strong>
              </div>

              <div>
                <span>Longitude</span>
                <strong>
                  {Number(selected.LONGITUDE).toFixed(3)}°
                </strong>
              </div>

              {selected.TEMP !== undefined && (
                <div>
                  <span>Temperature</span>
                  <strong>
                    {Number(selected.TEMP).toFixed(2)} °C
                  </strong>
                </div>
              )}

              {selected.PRES !== undefined && (
                <div>
                  <span>Pressure</span>
                  <strong>
                    {Number(selected.PRES).toFixed(1)} dbar
                  </strong>
                </div>
              )}

              {selected.PLATFORM_NUMBER !== undefined && (
                <div>
                  <span>Float</span>
                  <strong>
                    {selected.PLATFORM_NUMBER}
                  </strong>
                </div>
              )}

              {selected.TIME && (
                <div>
                  <span>Time</span>
                  <strong>
                    {new Date(selected.TIME).toLocaleString()}
                  </strong>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}