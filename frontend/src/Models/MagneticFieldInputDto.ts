export interface MagneticFieldInputDto {
    circuits: number;
    active_power: number;
    reactive_power: number;
    voltage: number;
    current: number;
    depth: number;
    distance_circuit: number;
    distance_phase: number;
    xVal: number;
    yMax: number;
    yMin: number;
    icnirpLimit: number;
    curve_above: number;
    cable_diameter: number;
    trefoil: boolean;
}

export const defaultMagneticFieldInput: MagneticFieldInputDto = {
    circuits: 2,
    active_power: 400,
    reactive_power: 100,
    voltage: 230,
    current: 0,
    depth: 0.8,
    distance_circuit: 1.6,
    distance_phase: 0.3,
    xVal: 15,
    yMax: 5,
    yMin: -5,
    icnirpLimit: 200,
    curve_above: 1.0,
    cable_diameter: 0.25,
    trefoil: false,
};
