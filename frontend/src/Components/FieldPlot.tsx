import React from "react";

interface FieldPlotProps {
    imageImageUrl: string | null;
}

const FieldPlot: React.FC<FieldPlotProps> = ({ imageImageUrl }) => {
    const imageUrl = imageImageUrl ? `data:image/png;base64,${imageImageUrl}` : null;
    
    return (
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Magnetic Field Plot"
                    style={{ width: "100%", height: "700px", objectFit: "scale-down" }}
                />
            )}
        </div>
    );
};

export default FieldPlot;
