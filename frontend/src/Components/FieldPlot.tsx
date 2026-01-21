import React from "react";

interface FieldPlotProps {
    imageImageUrl: string | null;
}

const FieldPlot: React.FC<FieldPlotProps> = ({ imageImageUrl }) => {
    return (
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            {imageImageUrl && (
                <img
                    src={imageImageUrl}
                    alt="Magnetic Field Plot"
                    style={{ width: "100%", height: "700px", objectFit: "scale-down" }}
                />
            )}
        </div>
    );
};

export default FieldPlot;
