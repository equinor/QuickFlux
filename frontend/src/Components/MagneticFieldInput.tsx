import {
    Autocomplete,
    Button,
    Card,
    Icon,
    TextField,
    Typography,
    CircularProgress,
    Accordion,
    Switch,
} from "@equinor/eds-core-react";
import { styled } from "styled-components";
import { tokens } from "@equinor/eds-tokens";
import { useRef, useState } from "react";
import { Icons } from "../Utils/Icons";
import { CreateMetaWithTooltip } from "../Utils/InputUtils";
import { MagneticFieldInputDto } from "../Models/MagneticFieldInputDto";
import { MagneticFieldResponse } from "../Models/MagneticFieldResponseDto";

const StyledInputView = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 500px;
`;
const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface MagneticFieldInputProps {
    setResponseData: React.Dispatch<React.SetStateAction<MagneticFieldResponse>>;
    inputData: MagneticFieldInputDto;
    setInputData: React.Dispatch<React.SetStateAction<MagneticFieldInputDto>>;
} 

const MagneticFieldInput: React.FC<MagneticFieldInputProps> = ({ setResponseData, inputData, setInputData }) => {
    
    // UI state
    const [useCurrent, setUseCurrent] = useState<boolean>(false);
    const [activePowerLabel, setActivePowerLabel] = useState<string>("Active Power [MW]");
    const [reactivePowerLabel, setReactivePowerLabel] = useState<string>("Reactive Power [MVar]");
    const [voltageLabel, setVoltageLabel] = useState<string>("Rated Line Voltage [kV]");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const limitTooltip = "Icnirp => International Commission on Non-Ionizing Radiation Protection";
    const curveAboveTooltip = "Curve height needs to be smaller than Y-max for the calculation area";
    const cableDiameterTooltip = "Cable diameter needs to be smaller than distance between phases";
    const currentTooltip = "If set, the active and reactive power will be ignored";
    const voltageLevelOptionsAC = [66, 132, 150, 220, 230, 275, 345, 400, 500];
    
    const tfDistanceCirRef = useRef<HTMLInputElement>(null);
    const tfDistancePhaseRef = useRef<HTMLInputElement>(null);
    const tfDepthRef = useRef<HTMLInputElement>(null);

    async function handleCalculation() {
        try {
            setIsLoading(true);
            
            const apiResponse = await fetch('http://localhost:5000/api/magnetic-field/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputData),
            });
            
            if (!apiResponse.ok) {
                throw new Error('Calculation failed');
            }
            
            const data = await apiResponse.json();
            setResponseData(data);
        } catch (error) {
            console.error("Failed to fetch calculation result:", error);
        } finally {
            setIsLoading(false);
        }
    }
    const handleCurveAboveChange = (value: number) => {
        if (value >= inputData.yMax) {
            setInputData({ ...inputData, curve_above: inputData.yMax - 0.1 });
        } else {
            setInputData({ ...inputData, curve_above: value });
        }
    };

    const handleDistanceCircuitChange = (value: number) => {
        const minDistanceCircuit = inputData.distance_phase * 2;
        if (value <= minDistanceCircuit) {
            if (tfDistanceCirRef.current) {
                tfDistanceCirRef.current.value = minDistanceCircuit.toString();
            }
            setInputData({ ...inputData, distance_circuit: minDistanceCircuit });
        } else {
            setInputData({ ...inputData, distance_circuit: value });
        }
    };

    const handleDistancePhaseChange = (value: number) => {
        if (value <= inputData.cable_diameter) {
            if (tfDistancePhaseRef.current) {
                tfDistancePhaseRef.current.value = inputData.cable_diameter.toString();
            }
            setInputData({ ...inputData, distance_phase: inputData.cable_diameter });
        } else {
            setInputData({ ...inputData, distance_phase: value });
        }
    };

    const handleCurrentChange = (value: number) => {
        if (value > 0) {
            setActivePowerLabel("Active Power [MW] - [Disabled] ");
            setReactivePowerLabel("Reactive Power [MVar] - [Disabled] ");
            setVoltageLabel("Rated Line Voltage [kV] - [Disabled] ");
            setUseCurrent(true);
        } else {
            setActivePowerLabel("Active Power [MW] ");
            setReactivePowerLabel("Reactive Power [MVar] ");
            setVoltageLabel("Rated Line Voltage [kV] ");
            setUseCurrent(false);
        }
        setInputData({ ...inputData, current: value });
    };

    const handleDepthhange = (value: number) => {
        const minValue = inputData.cable_diameter / 2 + inputData.distance_phase;
        if (value <= minValue) {
            if (tfDepthRef.current) {
                tfDepthRef.current.value = minValue.toString();
            }
            setInputData({ ...inputData, depth: minValue });
        } else {
            setInputData({ ...inputData, depth: value });
        }
    };

    const handleToggle = (event: any) => {
        setInputData({ ...inputData, trefoil: event.target.checked });
    };

    return (
        <StyledInputView>
            <Card variant="default" style={{ boxShadow: tokens.elevation.raised, padding: "8px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Icon name={Icons.Warning} color={tokens.colors.interactive.warning__resting.hex} />
                    <Typography style={{ marginLeft: "8px" }} variant="body_short" group="paragraph">
                        This calculation is for 1-core cables only.
                    </Typography>
                </div>
            </Card>
            <Card variant="default" style={{ boxShadow: tokens.elevation.raised, padding: "8px" }}>
                <HeaderContainer>
                    <Card.Header>
                        <Card.HeaderTitle>
                            <Typography variant="h2">Input</Typography>
                        </Card.HeaderTitle>
                    </Card.Header>
                </HeaderContainer>
                <Card.Content style={{ gap: "8px" }}>
                    <TextField
                        id="tfCircuits"
                        value={inputData.circuits}
                        max={5}
                        min={1}
                        label="No. of circuits"
                        placeholder="#Circuits"
                        type="number"
                        step="1.0"
                        onChange={(e: any) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 1 && value <= 5) {
                                setInputData({ ...inputData, circuits: value });
                            }
                        }}
                    />
                    <Switch defaultChecked={false} label={"Trefoil Arrangement"} onChange={handleToggle} />
                    <TextField
                        disabled={useCurrent}
                        id="tfActivePower"
                        value={inputData.active_power}
                        label={activePowerLabel}
                        placeholder="Watt [W] pr. circuit"
                        type="number"
                        step="1"
                        onChange={(e: any) => {
                            setInputData({ ...inputData, active_power: parseFloat(e.target.value) });
                        }}
                    ></TextField>
                    <TextField
                        disabled={useCurrent}
                        id="tfReactivePower"
                        value={inputData.reactive_power}
                        label={reactivePowerLabel}
                        placeholder="Reactive Power [MVAr]"
                        type="number"
                        step="1"
                        onChange={(e: any) => {
                            setInputData({ ...inputData, reactive_power: parseFloat(e.target.value) });
                        }}
                    ></TextField>
                    <Autocomplete
                        disabled={useCurrent}
                        id="voltage-input"
                        label={voltageLabel}
                        options={voltageLevelOptionsAC}
                        selectedOptions={[inputData.voltage]}
                        onOptionsChange={(e: any) => {
                            setInputData({ ...inputData, voltage: e.selectedItems[0] });
                        }}
                    ></Autocomplete>
                    <TextField
                        id="tfCurrent"
                        defaultValue={0}
                        meta={CreateMetaWithTooltip("A", currentTooltip)}
                        label="Current [A]"
                        placeholder="Current [A]"
                        type="number"
                        step="1"
                        onChange={(e: any) => {
                            handleCurrentChange(parseFloat(e.target.value));
                        }}
                    ></TextField>
                    <TextField
                        id="tfDepth"
                        inputRef={tfDepthRef}
                        defaultValue={0.8}
                        label="Depth [m]"
                        placeholder="Depth"
                        type="number"
                        step="0.1"
                        onChange={(e: any) => {
                            handleDepthhange(parseFloat(e.target.value));
                        }}
                    ></TextField>
                    <TextField
                        id="tfDistanceCir"
                        inputRef={tfDistanceCirRef}
                        defaultValue={1.6}
                        label="Distance between circuits (c-c) [m]"
                        placeholder="Distance between circuits"
                        type="number"
                        step="0.1"
                        onChange={(e: any) => {
                            handleDistanceCircuitChange(parseFloat(e.target.value));
                        }}
                    ></TextField>
                    <TextField
                        id="tfDistancePhase"
                        inputRef={tfDistancePhaseRef}
                        defaultValue={0.3}
                        label="Distance between phases (c-c) [m]"
                        placeholder="Distance between phases"
                        type="number"
                        step="0.01"
                        onChange={(e: any) => {
                            handleDistancePhaseChange(parseFloat(e.target.value));
                        }}
                    ></TextField>
                    <TextField
                        id="tfLimit"
                        meta={CreateMetaWithTooltip("μT", limitTooltip)}
                        label="Treshold "
                        value={inputData.icnirpLimit}
                        placeholder="Limit"
                        type="number"
                        step="1.0"
                        onChange={(e: any) => {
                            setInputData({ ...inputData, icnirpLimit: parseFloat(e.target.value) });
                        }}
                    />
                    <TextField
                        id="tfCurveY"
                        label="Curve Calculation Height"
                        meta={CreateMetaWithTooltip("m", curveAboveTooltip)}
                        placeholder="Meter Above"
                        type="number"
                        value={inputData.curve_above}
                        step="0.1"
                        onChange={(e: any) => {
                            handleCurveAboveChange(parseFloat(e.target.value));
                        }}
                    ></TextField>
                    <TextField
                        id="tfCabDiameter"
                        label="Cable Diameter [m]"
                        meta={CreateMetaWithTooltip("m", cableDiameterTooltip)}
                        placeholder="Cable Diameter"
                        type="number"
                        value={inputData.cable_diameter}
                        step="0.01"
                        onChange={(e: any) => {
                            setInputData({ ...inputData, cable_diameter: parseFloat(e.target.value) });
                        }}
                    ></TextField>
                    <Accordion>
                        <Accordion.Item isExpanded={false}>
                            <Accordion.Header>Calculation Area</Accordion.Header>
                            <Accordion.Panel>
                                <TextField
                                    id="tfX"
                                    value={inputData.xVal}
                                    label="X ± [m]"
                                    placeholder="X"
                                    type="number"
                                    step="0.1"
                                    onChange={(e: any) => {
                                        setInputData({ ...inputData, xVal: parseFloat(e.target.value) });
                                    }}
                                ></TextField>
                                <TextField
                                    id="tfYup"
                                    value={inputData.yMax}
                                    label="Y-up [m]"
                                    placeholder="Y"
                                    type="number"
                                    step="0.1"
                                    onChange={(e: any) => {
                                        setInputData({ ...inputData, yMax: parseFloat(e.target.value) });
                                    }}
                                ></TextField>
                                <TextField
                                    id="tfYdown"
                                    value={inputData.yMin}
                                    label="Y-down [m]"
                                    placeholder="Y"
                                    type="number"
                                    step="0.1"
                                    onChange={(e: any) => {
                                        setInputData({ ...inputData, yMin: parseFloat(e.target.value) });
                                    }}
                                ></TextField>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                    {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <CircularProgress size={32} value={0} />
                        </div>
                    ) : (
                        <Button onClick={() => handleCalculation()}>Start Calculation</Button>
                    )}
                </Card.Content>
            </Card>
        </StyledInputView>
    );
};

export default MagneticFieldInput;
