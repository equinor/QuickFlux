import { styled } from "styled-components";
import MagneticFieldInput from "./Components/MagneticFieldInput";
import { useState } from "react";
import FieldPlot from "./Components/FieldPlot";
import MagneticFluxDensityGraph from "./Components/MagneticFluxDensityGraph";
import TrenchLayout from "./Components/TrenchLayout";
import { Tabs } from "@equinor/eds-core-react";
import { defaultMagneticFieldResponse, MagneticFieldResponse } from "./Models/MagneticFieldResponseDto";
import { defaultMagneticFieldInput, MagneticFieldInputDto } from "./Models/MagneticFieldInputDto";

const StyledMainPage = styled.div`
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 16px;
    padding: 16px;
`;

export function MagneticFieldPage() {
    const [responseData, setResponseData] = useState<MagneticFieldResponse>(defaultMagneticFieldResponse);
    const [inputData, setInputData] = useState<MagneticFieldInputDto>(defaultMagneticFieldInput);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (value: number | string) => {
        setActiveTab(value as number);
    };

    return (
        <StyledMainPage>
            <MagneticFieldInput setResponseData={setResponseData} inputData={inputData} setInputData={setInputData} />
            <Tabs activeTab={activeTab} onChange={handleTabChange}>
                <Tabs.List>
                    <Tabs.Tab>Trench Layout</Tabs.Tab>
                    <Tabs.Tab>Magnetic Flux Density</Tabs.Tab>
                    <Tabs.Tab>Magnetic Field Distribution</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panels>
                    <Tabs.Panel>
                        <TrenchLayout dataInput={inputData} />
                    </Tabs.Panel>
                    <Tabs.Panel>
                        {responseData && responseData.x_coords.length > 0 && (
                            <div style={{ marginTop: "8px" }}>
                                <MagneticFluxDensityGraph dataResponse={responseData} dataInput={inputData} />
                            </div>
                        )}
                    </Tabs.Panel>
                    <Tabs.Panel>
                        <FieldPlot imageImageUrl={responseData?.image ?? null} />
                    </Tabs.Panel>
                </Tabs.Panels>
            </Tabs>
        </StyledMainPage>
    );
}

export default MagneticFieldPage;
