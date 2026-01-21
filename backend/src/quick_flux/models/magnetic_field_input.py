from pydantic import BaseModel


class MagneticFieldInput(BaseModel):
    circuits: int
    active_power: float
    reactive_power: float
    voltage: int
    current: int
    depth: float
    distance_circuit: float
    distance_phase: float
    xVal: float
    yMax: float
    yMin: float
    curve_above: float
    cable_diameter: float
    trefoil: bool = False
