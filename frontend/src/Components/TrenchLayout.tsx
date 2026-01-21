import React, { useEffect, useState } from "react";
import { MagneticFieldInputDto } from "../Models/MagneticFieldInputDto";

interface TrenchLayoutProps {
    dataInput: MagneticFieldInputDto
}

const TrenchLayout: React.FC<TrenchLayoutProps> = (
    { dataInput }
) => {
    const trench_scale = 120;
    const width = 1000;
    const height = 700;
    const [installationType, setInstallationType] = useState<"Trefoil" | "Flat" | "Right">("Flat");

    useEffect(() => {
        if (dataInput.trefoil) {
            setInstallationType("Trefoil");
        } else {
            setInstallationType("Flat");
        }
    }, [dataInput.trefoil]);

    // Define color scheme for phases
    //const phaseColors = ["#b27e59", "#000000", "#a6a6a6"];
    const phaseColors = {
        L1: "#b27e59",
        L2: "#000000",
        L3: "#a6a6a6",
    };

    // Delta values for different installation types
    const deltas = {
        Trefoil: [
            { dx: 0, dy: -Math.sqrt(3) / 2 },
            { dx: -0.5, dy: 0 },
            { dx: 0.5, dy: 0 },
        ],
        Flat: [
            { dx: -1, dy: 0 },
            { dx: 0, dy: 0 },
            { dx: 1, dy: 0 },
        ],
        Right: [
            { dx: 0.5, dy: -1 },
            { dx: -0.5, dy: 0 },
            { dx: 0.5, dy: 0 },
        ],
    };

    // Original coordinates from VBA converted to SVG coordinate system
    const xOrigo = width / 2;
    const yOrigo = height / 2;

    // Calculate circuit width based on installation type
    const currentDeltas = deltas[installationType as "Trefoil" | "Flat" | "Right"];
    const deltaX = currentDeltas.map((d) => d.dx);
    const deltaXMin = Math.min(...deltaX);
    const deltaXMax = Math.max(...deltaX);
    const circuitWidth = (deltaXMax - deltaXMin) * dataInput.distance_phase;

    // Calculate trench dimensions
    const trenchWidth = dataInput.distance_circuit * (dataInput.circuits - 1) + circuitWidth + 0.3;
    
    // Extract commonly used values from dataInput - use directly without local state
    const depth = dataInput.depth;
    const distancePhase = dataInput.distance_phase;
    const cableDiameter = dataInput.cable_diameter;
    const circuits = dataInput.circuits;
    const distanceCircuits = dataInput.distance_circuit;

    const topCableOffset = installationType === "Trefoil" ? (-Math.sqrt(3) / 2) * dataInput.distance_phase : 0;
    const adjustedYOrigo = yOrigo + trench_scale * topCableOffset;

    return (
        <>
            {depth > 0 && (
                <>
                    <svg width={"100%"} height={height} viewBox={`0 0 ${"100%"} ${height}`}>
                        {/* Draw trench walls */}
                        <line
                            x1={xOrigo - (trenchWidth / 2) * trench_scale}
                            y1={yOrigo + 0.3 * trench_scale}
                            x2={xOrigo + (trenchWidth / 2) * trench_scale}
                            y2={yOrigo + 0.3 * trench_scale}
                            stroke="black"
                        />
                        <line
                            x1={xOrigo - (trenchWidth / 2 + (depth + 0.3) / 2 + 0.3) * trench_scale}
                            y1={yOrigo - depth * trench_scale}
                            x2={xOrigo + (trenchWidth / 2 + (depth + 0.3) / 2 + 0.3) * trench_scale}
                            y2={yOrigo - depth * trench_scale}
                            stroke="black"
                        />
                        <line
                            x1={xOrigo - (trenchWidth / 2) * trench_scale}
                            y1={yOrigo + 0.3 * trench_scale}
                            x2={xOrigo - (trenchWidth / 2 + (depth + 0.3) / 2) * trench_scale}
                            y2={yOrigo - depth * trench_scale}
                            stroke="black"
                        />

                        <line
                            x1={xOrigo + (trenchWidth / 2) * trench_scale}
                            y1={yOrigo + 0.3 * trench_scale}
                            x2={xOrigo + (trenchWidth / 2 + (depth + 0.3) / 2) * trench_scale}
                            y2={yOrigo - depth * trench_scale}
                            stroke="black"
                        />

                        {/* Draw depth left arrow */}
                        <line
                            x1={xOrigo - (trenchWidth / 2 + (depth + 0.5) / 2) * trench_scale}
                            y1={3 + yOrigo - depth * trench_scale}
                            x2={xOrigo - (trenchWidth / 2 + (depth + 0.5) / 2) * trench_scale}
                            y2={-5 + adjustedYOrigo - (dataInput.cable_diameter * 100) / 2}
                            stroke="black"
                            markerStart="url(#arrow-start)"
                            markerEnd="url(#arrow-end)"
                        />

                        {/* Draw dashed horizontal line to the middle of the first cable */}
                        <line
                            x1={xOrigo - (trenchWidth / 2 + (depth + 0.5) / 2) * trench_scale}
                            y1={-3 + adjustedYOrigo - (dataInput.cable_diameter * 100) / 2}
                            x2={xOrigo - (((dataInput.circuits - 1) * dataInput.distance_circuit) / 2) * trench_scale}
                            y2={-3 + adjustedYOrigo - (dataInput.cable_diameter * 100) / 2}
                            stroke="black"
                            strokeDasharray="4"
                        />

                        {/* Draw depth right arrow */}
                        <line
                            x1={xOrigo + (trenchWidth / 2 + (depth + 0.5) / 2) * trench_scale}
                            y1={yOrigo - 0.2}
                            x2={xOrigo + (trenchWidth / 2 + (depth + 0.5) / 2) * trench_scale}
                            y2={yOrigo + 1.5 - depth * trench_scale}
                            stroke="black"
                            markerStart="url(#arrow-start)"
                            markerEnd="url(#arrow-end)"
                        />

                        {/* Draw depth dashed line */}
                        <line
                            x1={xOrigo + (trenchWidth / 2 + (depth - 1) / 2) * trench_scale}
                            y1={yOrigo}
                            x2={xOrigo + (trenchWidth / 2 + (depth + 1) / 2) * trench_scale}
                            y2={yOrigo}
                            stroke="black"
                            strokeDasharray="4"
                        />

                        {/* Depth text */}
                        <text
                            x={23 + xOrigo + (trenchWidth / 2 + (depth + 0.8) / 2) * trench_scale}
                            y={yOrigo - (depth * trench_scale) / 2}
                            fill="black"
                            fontSize="12"
                            textAnchor="middle"
                        >
                            Depth = {depth} m
                        </text>

                        <text
                            x={xOrigo - (trenchWidth / 2 + (depth + 0.8) / 2) * trench_scale - 10}
                            y={-3 + adjustedYOrigo - (dataInput.cable_diameter * 100) / 2}
                            fill="black"
                            fontSize="12"
                            textAnchor="end"
                        >
                            Top Formation Depth ={" "}
                            {installationType === "Trefoil"
                                ? (depth - (Math.sqrt(3) / 2) * distancePhase - cableDiameter / 2).toFixed(2)
                                : (depth - cableDiameter / 2).toFixed(2)}{" "}
                            m
                        </text>

                        {/* Draw horizontal arrow for distance between circuits */}
                        {circuits > 1 && (
                            <>
                                <line
                                    x1={xOrigo + 5 - (((circuits - 1) * distanceCircuits) / 2) * trench_scale}
                                    y1={yOrigo + 0.4 * trench_scale}
                                    x2={-5 + xOrigo + (((3 - circuits) * distanceCircuits) / 2) * trench_scale}
                                    y2={yOrigo + 0.4 * trench_scale}
                                    stroke="black"
                                    markerStart="url(#arrow-start)"
                                    markerEnd="url(#arrow-end)"
                                />
                                <text
                                    x={xOrigo - (((circuits - 1) * distanceCircuits) / 2) * trench_scale}
                                    y={yOrigo + 0.55 * trench_scale}
                                    fill="black"
                                    fontSize="12"
                                    textAnchor="start"
                                >
                                    Distance between circuits = {distanceCircuits}
                                </text>
                                {/* Draw vertical dashed lines */}
                                <line
                                    x1={xOrigo - (((circuits - 1) * distanceCircuits) / 2) * trench_scale}
                                    y1={yOrigo + 0.42 * trench_scale}
                                    x2={xOrigo - (((circuits - 1) * distanceCircuits) / 2) * trench_scale}
                                    y2={yOrigo}
                                    stroke="black"
                                    strokeDasharray="4"
                                />
                                <line
                                    x1={xOrigo + (((3 - circuits) * distanceCircuits) / 2) * trench_scale}
                                    y1={yOrigo + 0.42 * trench_scale}
                                    x2={xOrigo + (((3 - circuits) * distanceCircuits) / 2) * trench_scale}
                                    y2={yOrigo}
                                    stroke="black"
                                    strokeDasharray="4"
                                />
                            </>
                        )}

                        {/* Draw cables */}
                        {Array.from({ length: circuits }).map((_, circuitIndex) => {
                            const mirrorFactor = circuitIndex % 2 === 0 ? 1 : -1;
                            const circuitOriginX =
                                xOrigo +
                                trench_scale *
                                    (-((circuits - 1) * distanceCircuits) / 2 + circuitIndex * distanceCircuits);

                            return currentDeltas.map((phase, phaseIndex) => {
                                const cx = circuitOriginX + trench_scale * mirrorFactor * distancePhase * phase.dx;
                                const cy = yOrigo + trench_scale * distancePhase * phase.dy;
                                const radius = (trench_scale * cableDiameter) / 2;
                                const phaseName = `L${phaseIndex + 1}` as keyof typeof phaseColors;
                                return (
                                    <g key={`circuit-${circuitIndex}-phase-${phaseIndex}`}>
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={radius}
                                            stroke="black"
                                            fill={phaseColors[phaseName]}
                                        />
                                        <text
                                            x={cx}
                                            y={cy}
                                            fill="white"
                                            fontSize="8"
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                        >
                                            L{phaseIndex + 1}
                                        </text>
                                    </g>
                                );
                            });
                        })}

                        {/* Define arrow markers */}
                        <defs>
                            <marker
                                id="arrow-start"
                                viewBox="0 0 10 10"
                                refX="5"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
                            </marker>
                            <marker
                                id="arrow-end"
                                viewBox="0 0 10 10"
                                refX="5"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
                            </marker>
                        </defs>
                    </svg>
                </>
            )}
        </>
    );
};

export default TrenchLayout;
