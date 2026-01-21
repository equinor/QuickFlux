import "chart.js/auto";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@equinor/eds-core-react";
import styled from "styled-components";
import { tokens } from "@equinor/eds-tokens";
import { Chart, ChartOptions, ChartData } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { MagneticFieldInputDto } from "../Models/MagneticFieldInputDto";
Chart.register(annotationPlugin);

const StyledDataCard = styled.div`
    padding: 8px;
    height: 75vh;
    box-shadow: ${tokens.elevation.raised};
`;

interface ResponseData {
    image: string;
    x_coords: number[];
    B_0m: number[];
    B_1m: number[];
}

interface MagneticFluxDensityProp {
    dataResponse: ResponseData;
    dataInput: MagneticFieldInputDto;
}

const MagneticFluxDensityGraph: React.FC<MagneticFluxDensityProp> = ({ dataResponse, dataInput }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    const treshold = dataInput.icnirpLimit;
    const curveAbove = dataInput.curve_above;

    const greenCucumber = "#005F57";
    const resting = "#97CACE";
    const [showThresholdLine, setShowThresholdLine] = useState(true);
    const [showAnnotations, setShowAnnotations] = useState(true);

    useEffect(() => {
        if (!dataResponse || !chartRef.current) return;

        const filterEverySecond = (arr: number[]) => arr.filter((_, index) => index % 2 === 0);
        const formattedXCoords = filterEverySecond(dataResponse?.x_coords.map((coord) => parseFloat(coord.toFixed(1))));
        const filteredB_0m = filterEverySecond(dataResponse?.B_0m);
        const filteredB_1m = filterEverySecond(dataResponse?.B_1m);

        const maxB_0m = Math.max(...filteredB_0m);
        const maxB_1m = Math.max(...filteredB_1m);

        const data: ChartData<"line"> = {
            labels: formattedXCoords,
            datasets: [
                {
                    label: "Ground Level",
                    data: filteredB_0m,
                    borderColor: filteredB_0m.map((value) => (value > treshold ? "red" : greenCucumber)),
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBackgroundColor: filteredB_0m.map((value) => (value > treshold ? "red" : greenCucumber)),
                },
                {
                    label: `${curveAbove}m Above`,
                    data: filteredB_1m,
                    borderColor: filteredB_1m.map((value) => (value > treshold ? "red" : resting)),
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBackgroundColor: filteredB_1m.map((value) => (value > treshold ? "red" : resting)),
                },
            ],
        };

        const options: ChartOptions<"line"> = {
            scales: {
                y: {
                    title: {
                        text: "Magnetic Flux Density [μT]",
                        display: true,
                    },
                },
                x: {
                    title: {
                        text: "Length [m]",
                        display: true,
                    },
                    ticks: { stepSize: 1 },
                },
            },
            plugins: {
                annotation: {
                    annotations: {
                        ...(showThresholdLine && {
                            thresholdLine: {
                                type: "line",
                                scaleID: "y",
                                value: treshold, // Threshold value
                                borderColor: "red",
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    content: `Threshold (${treshold} μT)`,
                                    display: true,
                                    position: "end",
                                    backgroundColor: tokens.colors.ui.background__default.hex,
                                    color: "red",
                                },
                            },
                        }),
                        ...(showAnnotations && {
                            maxLineB_0m: {
                                type: "line",
                                scaleID: "y",
                                value: maxB_0m,
                                borderColor: maxB_0m < treshold ? greenCucumber : "red",
                                borderWidth: 2,
                                borderDash: [4, 4],
                                label: {
                                    content: `Ground Level Max: ${maxB_0m.toFixed(2)} μT`,
                                    display: true,
                                    position: "end",
                                    backgroundColor: tokens.colors.ui.background__default.hex,
                                    color: maxB_0m < treshold ? greenCucumber : "red",
                                },
                            },
                            maxLineB_1m: {
                                type: "line",
                                scaleID: "y",
                                value: maxB_1m,
                                borderColor: resting,
                                borderWidth: 2,
                                borderDash: [4, 4],
                                xMin: formattedXCoords[filteredB_1m.indexOf(maxB_1m)],
                                xMax: formattedXCoords[formattedXCoords.length - 1],
                                label: {
                                    content: `Max: ${maxB_1m.toFixed(2)} μT`,
                                    display: true,
                                    position: "end",
                                    backgroundColor: "#FFF",
                                    color: resting,
                                },
                            },
                        }),
                    },
                },
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        color: "black",
                    },
                },
                tooltip: {
                    callbacks: {
                        title: function (tooltipItems: { label: string }[]): string {
                            return `X: ${tooltipItems[0].label} m`;
                        },
                        label: function (tooltipItem) {
                            const datasetLabel = tooltipItem.dataset.label || "";
                            const value = parseFloat(tooltipItem.raw as string).toFixed(2);
                            return `${datasetLabel}: Y: ${value} μT`;
                        },
                    },
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 12 },
                    footerFont: { size: 10 },
                    displayColors: false,
                },
            },
            maintainAspectRatio: false,
        };

        // Destroy the previous chart instance if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Create a new chart instance
        chartInstanceRef.current = new Chart(chartRef.current, {
            type: "line",
            data,
            options,
        });

        // Cleanup function to destroy the chart on unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [dataResponse, treshold, curveAbove, showThresholdLine, showAnnotations]);

    return (
        <StyledDataCard>
            <div style={{ position: "relative", height: "100%", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                    <Button
                        variant="outlined"
                        onClick={() => setShowAnnotations((prev) => !prev)}
                        style={{ position: "absolute", top: "4px", right: "160px", height: "30px", zIndex: 10 }}
                    >
                        Show Annotations
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setShowThresholdLine((prev) => !prev)}
                        style={{ position: "absolute", top: "4px", right: "10px", height: "30px", zIndex: 10 }}
                    >
                        Toggle Threshold
                    </Button>
                </div>
                <canvas ref={chartRef} style={{ height: "100%", width: "100%" }} />
            </div>
        </StyledDataCard>
    );
};

export default MagneticFluxDensityGraph;
